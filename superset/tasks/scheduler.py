# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
import logging
from datetime import datetime, timezone

from celery import Celery
from celery.exceptions import SoftTimeLimitExceeded

from superset import app, is_feature_enabled
from superset.commands.exceptions import CommandException
from superset.commands.report.exceptions import ReportScheduleUnexpectedError
from superset.commands.report.execute import AsyncExecuteReportScheduleCommand
from superset.commands.report.log_prune import AsyncPruneReportScheduleLogCommand
from superset.commands.sql_lab.query import QueryPruneCommand
from superset.daos.report import ReportScheduleDAO
from superset.extensions import celery_app
from superset.stats_logger import BaseStatsLogger
from superset.tasks.cron_util import cron_schedule_window
from superset.utils.core import LoggerLevel
from superset.utils.log import get_logger_from_status

import requests
import psycopg2

logger = logging.getLogger(__name__)


@celery_app.task(name="reports.scheduler")
def scheduler() -> None:
    """
    Celery beat main scheduler for reports
    """
    stats_logger: BaseStatsLogger = app.config["STATS_LOGGER"]
    stats_logger.incr("reports.scheduler")

    if not is_feature_enabled("ALERT_REPORTS"):
        return
    active_schedules = ReportScheduleDAO.find_active()
    #print(active_schedules)
    triggered_at = (
        datetime.fromisoformat(scheduler.request.expires)
        - app.config["CELERY_BEAT_SCHEDULER_EXPIRES"]
        if scheduler.request.expires
        else datetime.now(tz=timezone.utc)
    )
    for active_schedule in active_schedules:
        print(active_schedule.description)
        print(active_schedule.report_format)
        for schedule in cron_schedule_window(
            triggered_at, active_schedule.crontab, active_schedule.timezone
        ):
            logger.info("Scheduling alert %s eta: %s", active_schedule.name, schedule)
            async_options = {"eta": schedule}
            if (
                active_schedule.working_timeout is not None
                and app.config["ALERT_REPORTS_WORKING_TIME_OUT_KILL"]
            ):
                async_options["time_limit"] = (
                    active_schedule.working_timeout
                    + app.config["ALERT_REPORTS_WORKING_TIME_OUT_LAG"]
                )
                async_options["soft_time_limit"] = (
                    active_schedule.working_timeout
                    + app.config["ALERT_REPORTS_WORKING_SOFT_TIME_OUT_LAG"]
                )
            execute.apply_async((active_schedule.id,), **async_options)

@celery_app.task(name="api.scheduler")
def api_scheduler() -> None:
    stats_logger: BaseStatsLogger = app.config["STATS_LOGGER"]
    stats_logger.incr("api.scheduler")

    try:
        active_api_schedules = ReportScheduleDAO.find_active_api()
        triggered_at = (
            datetime.fromisoformat(scheduler.request.expires)
            - app.config["CELERY_BEAT_SCHEDULER_EXPIRES"]
            if scheduler.request.expires
            else datetime.now(tz=timezone.utc)
        )
        for active_api_schedule in active_api_schedules:
            print("Iam Here API Scheduler")
            print(active_api_schedule)
            print(active_api_schedule.description)
            url, data_part = active_api_schedule.description.split('#')
            data_list = data_part.split(',')
            # Output the results
            print("URL:", url)
            print("Data List:", data_list)
            print("TableName:", active_api_schedule.name)

            db_config = {
                "dbname": "examples",
                "user": "superset",
                "password": "superset",
                "host": "superset_db",  # Your PostgreSQL host
                "port": "5432"
            }

            keys = data_list
            url = url
            table_name = active_api_schedule.name
            print(f"Keys:{keys}")

            if not keys or not url or not table_name:
                return jsonify({'error': 'Missing keys, url, or table_name in the request body'}), 400

            # Fetch data from the API
            response = requests.get(url)
            if response.status_code != 200:
                return jsonify({'error': 'Failed to fetch data from the API'}), 500

            api_data = response.json()
            # Example selected keys
            selected_keys = keys
            split_keys = [key.split('.') for key in selected_keys]
            columns = [split_key[-1] for split_key in split_keys]

            # Process the results
            rows = process_results(api_data, split_keys)

            conn = psycopg2.connect(**db_config)
            cur = conn.cursor()
            # Create table dynamically based on the columns from the API response
            create_table_query = f"""CREATE TABLE IF NOT EXISTS {table_name} (
                {", ".join([f'"{col}" TEXT' for col in columns])}
            );"""
            cur.execute(create_table_query)

            for entry in rows:
                # Check if the entry already exists in the table
                select_query = f"""
                    SELECT 1 FROM {table_name} 
                    WHERE {" AND ".join([f'CAST("{col}" AS TEXT) = %s' if isinstance(entry[i], str) else f'CAST("{col}" AS INTEGER) = %s' for i, col in enumerate(columns)])};
                """
                cur.execute(select_query, entry)
                existing_entry = cur.fetchone()

                # If the entry does not exist, insert the new row
                if not existing_entry:
                    insert_query = f"""INSERT INTO {table_name} ({", ".join([f'"{col}"' for col in columns])}) 
                                        VALUES ({", ".join(['%s' for _ in columns])});"""
                    cur.execute(insert_query, entry)
            # Grant necessary permissions to the user 'admin'
            #grant_permissions_query = f"""GRANT SELECT ON TABLE examples.public.{table_name} TO PUBLIC;"""
            #cur.execute(grant_permissions_query)

            conn.commit()
            cur.close()
            conn.close()
            # For testing: print rows to logger
            for row in rows:
                #logger.info(f"Row: {row}")
                print(f"Row: {row}")

    except SoftTimeLimitExceeded as ex:
        logger.warning("A timeout occurred while api schedule logs: %s", ex)
    except CommandException:
        logger.exception("An exception occurred while api schedule logs")

def process_results(data: dict, keys: list) -> list:
    """Processes the 'Results' key in the JSON response."""

    processed_rows = []
    root_key = keys[0][0]

    # Iterate over each object in 'root_key'
    for index, result in enumerate(data[root_key]):
        row = []
        # For each set of split keys (e.g., ['Results', 'Country'], ['Results', 'VehicleTypes', 'Name'])
        for key in keys:
            # Remove the first element (root_key) and process the rest
            value = extract_value(result, key[1:])
            row.append(value)
        processed_rows.append(row)

    return processed_rows

def extract_value(entry: dict, key_parts: list):
    """Recursive function to extract value from nested dictionary/list."""

    if not key_parts:
        return None

    key = key_parts[0]
    #print(f"[extract_value] Current key: {key}")

    if isinstance(entry, list):
        #print("[extract_value] Data is a list, iterating over each item...")
        result = []
        for item in entry:
            value = extract_value(item, key_parts)
            result.append(value)
        return result

    elif isinstance(entry, dict):
        #print(f"[extract_value] Data is a dict. Checking if key '{key}' is present in data...")
        if key in entry:
            return extract_value(entry[key], key_parts[1:]) if len(key_parts) > 1 else entry[key]
        else:
            print(f"[extract_value] Key '{key}' not found.")
            #print("[extract_value] Returning None (key not found or data is not a dict/list)")
            return None

@celery_app.task(name="reports.execute", bind=True)
def execute(self: Celery.task, report_schedule_id: int) -> None:
    stats_logger: BaseStatsLogger = app.config["STATS_LOGGER"]
    stats_logger.incr("reports.execute")

    task_id = None
    try:
        task_id = execute.request.id
        scheduled_dttm = execute.request.eta
        logger.info(
            "Executing alert/report, task id: %s, scheduled_dttm: %s",
            task_id,
            scheduled_dttm,
        )
        AsyncExecuteReportScheduleCommand(
            task_id,
            report_schedule_id,
            scheduled_dttm,
        ).run()
    except ReportScheduleUnexpectedError:
        logger.exception(
            "An unexpected error occurred while executing the report: %s", task_id
        )
        self.update_state(state="FAILURE")
    except CommandException as ex:
        logger_func, level = get_logger_from_status(ex.status)
        logger_func(
            f"A downstream {level} occurred "
            f"while generating a report: {task_id}. {ex.message}",
            exc_info=True,
        )
        if level == LoggerLevel.EXCEPTION:
            self.update_state(state="FAILURE")


@celery_app.task(name="reports.prune_log")
def prune_log() -> None:
    stats_logger: BaseStatsLogger = app.config["STATS_LOGGER"]
    stats_logger.incr("reports.prune_log")

    try:
        AsyncPruneReportScheduleLogCommand().run()
    except SoftTimeLimitExceeded as ex:
        logger.warning("A timeout occurred while pruning report schedule logs: %s", ex)
    except CommandException:
        logger.exception("An exception occurred while pruning report schedule logs")


@celery_app.task(name="prune_query")
def prune_query() -> None:
    stats_logger: BaseStatsLogger = app.config["STATS_LOGGER"]
    stats_logger.incr("prune_query")

    try:
        QueryPruneCommand(
            prune_query.request.properties.get("retention_period_days")
        ).run()
    except CommandException as ex:
        logger.exception("An error occurred while pruning queries: %s", ex)
