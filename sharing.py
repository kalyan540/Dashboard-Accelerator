@expose("/api/dataset/update", methods=["POST"])
    def update_dataset(self) -> FlaskResponse:

        try:
            # Extract data from the request body
            body = request.get_json()
            database = body.get('database', '')
            table_name = body.get('table_name', '')
            rows = body.get('formData', [])

            db_config = {
            "dbname": database,
            "user": "superset",
            "password": "superset",
            "host": "db",  # Your PostgreSQL host
            "port": "5432"
            }
            if not database or not table_name:
                return jsonify({'error': 'Missing database or table_name in the request body'}), 400

            conn = psycopg2.connect(**db_config)
            cur = conn.cursor()
            # Grant necessary permissions to the user 'admin'
            grant_permissions_query = f"""GRANT SELECT ON TABLE {database}.public.{table_name} TO PUBLIC;"""
            cur.execute(grant_permissions_query)

            columns = rows[0].keys()

            for entry in rows:
                insert_query = f"""INSERT INTO {table_name} ({", ".join([f'"{col}"' for col in columns])}) 
                VALUES ({", ".join(['%s' for _ in columns])});"""
                cur.execute(insert_query, entry)

            conn.commit()
            cur.close()
            conn.close()
            # For testing: print rows to logger
            for row in rows:
                logger.info(f"Row: {row}")
                print(f"Row: {row}")

            return jsonify({
                'message': f'Successfully inserted {len(rows)} row(s)'
            }), 200
        except Exception as e:
            print(f"Error occurred: {e}")
            return jsonify({'error': str(e)}), 500