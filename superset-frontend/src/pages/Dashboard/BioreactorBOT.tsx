import React, { useState } from "react";
import Chatbot from './Chatbot.png';
import { nanoid } from 'nanoid';
import Send from './send.png';
//import { useID } from 'src/views/idOrSlugContext';
//import { startQuery, querySuccess, queryFailed } from "src/SqlLab/actions/sqlLab";
import {
    SupersetClient,
    t,
    COMMON_ERR_MESSAGES,
    getClientErrorObject,
} from '@superset-ui/core';

//import { Dispatch } from "redux"; // Import Dispatch for typing

// Define the type for the SQL query object
interface SQLQuery {
    id?: string;
    dbId: number;
    sql: string;
    sqlEditorId: string;
    tab: string;
    schema: string;
    tempTable: string;
    queryLimit: number;
    runAsync: boolean;
    ctas: boolean;
    ctas_method: string;
}


const BioreactorBOT = () => {
    const [query, setQuery] = useState(""); // State to hold input value
    const [currentIndex, setCurrentIndex] = useState<number | null>(null); // Track the current selected query index
    const [showSuggestions, setShowSuggestions] = useState(false); // State to show/hide suggestions
    const [tableData, setTableData] = useState<any[]>([]);

    //const { embedchart } = useID();

    const suggestions = [
        {
            text: "Which is the best bioreactor in terms of performance?",
            sql: `SELECT 
                    plant_name,
                    bioreactor_name, 
                    performance 
                  FROM 
                    "WorldbioreactorData" 
                  ORDER BY 
                    performance DESC 
                  LIMIT 1;`,
        },
        {
            text: "Which plant has the best productivity?",
            sql: `SELECT 
                    plant_name, 
                    performance AS productivity 
                  FROM 
                    "WorldbioreactorData" 
                  ORDER BY 
                    productivity DESC 
                  LIMIT 1;`,
        },
        {
            text: "Which bioreactor is less in use?",
            sql: `SELECT 
                    plant_name,
                    bioreactor_name, 
                    COUNT(*) AS usage_count 
                  FROM 
                    "WorldbioreactorData" 
                  WHERE 
                    availability < 100 
                  GROUP BY 
                    plant_name,
                    bioreactor_name 
                  ORDER BY 
                    usage_count ASC 
                  LIMIT 1;`,
        },
    ];

    const runQuery = async (sqlquery: SQLQuery) => {
        const postPayload = {
            client_id: sqlquery.id,
            database_id: sqlquery.dbId,
            json: true,
            runAsync: sqlquery.runAsync,
            schema: sqlquery.schema,
            sql: sqlquery.sql,
            sql_editor_id: sqlquery.sqlEditorId,
            tab: sqlquery.tab,
            tmp_table_name: sqlquery.tempTable,
            select_as_cta: sqlquery.ctas,
            ctas_method: sqlquery.ctas_method,
            queryLimit: sqlquery.queryLimit,
            expand_data: true,
        };

        const search = window.location.search || "";

        try {
            console.log("Starting query...");
            const response = await SupersetClient.post({
                endpoint: `/api/v1/sqllab/execute/${search}`,
                body: JSON.stringify(postPayload),
                headers: { "Content-Type": "application/json" },
                parseMethod: "json-bigint",
            });

            const { json } = response;

            if (json?.data) {
                setTableData(json.data); // Save response data to state
                console.log("Data fetched:", json.data);
            }

            if (!sqlquery.runAsync) {
                console.log("Query successful:", json);
            }
        } catch (response) {
            const error = await getClientErrorObject(response);
            let message =
                error.error || error.message || error.statusText || t("Unknown error");
            if (message.includes("CSRF token")) {
                message = t(COMMON_ERR_MESSAGES.SESSION_TIMED_OUT);
            }
            console.error("Query failed:", message, error.link, error.errors);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value); // Update state when input changes
    };

    const handleSuggestionClick = (suggestion: typeof suggestions[0], index: number) => {
        setQuery(suggestion.text); // Set the clicked suggestion to the input
        setCurrentIndex(index);
        setShowSuggestions(false); // Hide suggestions after selection
    };

    /*const handleSubmit = () => {
        // Set the index based on the current query
        console.log(runQuery(sqlquery));
        const matchedIndex = suggestions.findIndex(suggestion =>
            suggestion.toLowerCase() === query.toLowerCase()
        );
        if (matchedIndex !== -1) {
            setCurrentIndex(matchedIndex); // Set the iframe to the correct chart
        }
    };*/
    const handleSubmit = () => {
        // If the input matches a suggestion, use its SQL command
        const matchedSuggestion = suggestions.find(s =>
            s.text.toLowerCase() === query.toLowerCase()
        );

        if (matchedSuggestion) {
            runQuery({
                id: nanoid(11),
                dbId: 1,
                sql: matchedSuggestion.sql,
                sqlEditorId: "1",
                tab: "Suggestion Query",
                schema: "public",
                tempTable: "",
                queryLimit: 100000,
                runAsync: false,
                ctas: false,
                ctas_method: "TABLE",
            });
        } else {
            // Assume input is a custom SQL query
            runQuery({
                id: nanoid(11),
                dbId: 1,
                sql: query, // Directly use user input as SQL
                sqlEditorId: "1",
                tab: "Custom Query",
                schema: "public",
                tempTable: "",
                queryLimit: 100000,
                runAsync: false,
                ctas: false,
                ctas_method: "TABLE",
            });
        }
    };

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* First row */}
            <div
                style={{
                    height: "70px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 10px",
                    borderBottom: "1px solid #ccc",
                    position: "relative", // For absolute positioning of dropdown
                }}
            >
                <img src={Chatbot} alt="Chatbot" style={{ height: "50px" }} />
                <div style={{ flex: 1, margin: "0 10px", position: "relative" }}>
                    <input
                        type="text"
                        placeholder="write your query"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => setShowSuggestions(true)} // Show suggestions on focus
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                        }}
                    />
                    {showSuggestions && (
                        <ul
                            style={{
                                listStyleType: "none",
                                margin: 0,
                                padding: "5px",
                                backgroundColor: "white",
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                zIndex: 10,
                            }}
                        >
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion, index)}
                                    style={{
                                        padding: "10px",
                                        cursor: "pointer",
                                        borderBottom:
                                            index !== suggestions.length - 1
                                                ? "1px solid #ccc"
                                                : "none",
                                        backgroundColor:
                                            currentIndex === index ? "#f0f0f0" : "white", // Highlight selected suggestion
                                    }}
                                >
                                    {suggestion.text}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button
                    onClick={handleSubmit} // Trigger action on button click
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    <span>Send</span>
                    <img src={Send} alt="Send" style={{ height: "20px", width: "20px" }} />
                </button>
            </div>

            {/* Second row */}
            <div style={{ flex: 1, padding: "20px", backgroundColor: "#f9f9f9" }}>
                {/*currentIndex !== null && embedchart[currentIndex] && (
                    <iframe
                        src={embedchart[currentIndex]} // Replace with the desired URL
                        title="Chart Representation"
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            borderRadius: "5px",
                        }}
                    />)*/
                    tableData.length > 0 ? (
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                textAlign: "left",
                            }}
                        >
                            <thead>
                                <tr>
                                    {Object.keys(tableData[0]).map((key, index) => (
                                        <th
                                            key={index}
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                padding: "10px",
                                                backgroundColor: "#f1f1f1",
                                            }}
                                        >
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {Object.values(row).map((value, cellIndex) => (
                                            <td
                                                key={cellIndex}
                                                style={{
                                                    borderBottom: "1px solid #eee",
                                                    padding: "10px",
                                                }}
                                            >
                                                {value}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p></p>
                    )}
            </div>
        </div>
    );
};

export default BioreactorBOT;