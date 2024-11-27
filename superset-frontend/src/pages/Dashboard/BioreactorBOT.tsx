import React, { useState, useRef, useEffect } from "react";
import Chatbot from './Chatbot.png';
import { nanoid } from 'nanoid';
import Send from './send.png';
import { SupersetClient, t, COMMON_ERR_MESSAGES, getClientErrorObject } from '@superset-ui/core';

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
    //const [currentIndex, setCurrentIndex] = useState<number | null>(null); // Track the current selected query index
    //const [showSuggestions, setShowSuggestions] = useState(false); // State to show/hide suggestions
    const [tableData, setTableData] = useState<any[]>([]);
    //const suggestionBoxRef = useRef<HTMLDivElement | null>(null);

    // WebSocket initialization
    const socket = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Open WebSocket connection
        socket.current = new WebSocket('ws://localhost:8765');

        socket.current.onopen = () => {
            console.log("Connected to WebSocket server");
        };

        socket.current.onmessage = (event) => {
            const sqlQuery = event.data; // Assuming the WebSocket server sends back the SQL query
            console.log(`Received SQL Query: ${sqlQuery}`);
            runQuery({
                id: nanoid(11),
                dbId: 1,
                sql: sqlQuery, // Use the SQL query received from WebSocket
                sqlEditorId: "1",
                tab: "WebSocket Query",
                schema: "public",
                tempTable: "",
                queryLimit: 100000,
                runAsync: false,
                ctas: false,
                ctas_method: "TABLE",
            });
        };

        socket.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.current.onclose = () => {
            console.log("Disconnected from WebSocket server");
        };

        // Cleanup on component unmount
        return () => {
            if (socket.current) {
                socket.current.close();
            }
        };
    }, []);

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

    const handleSubmit = () => {
        // Send the query input to the WebSocket server
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(query); // Send the query to the WebSocket server
            console.log("Sent query to WebSocket:", query);
        } else {
            console.log("WebSocket not open yet.");
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
                        placeholder="Write your query"
                        value={query}
                        onChange={handleInputChange}
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                        }}
                    />
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
                {tableData.length > 0 ? (
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
                    <p>No data available.</p>
                )}
            </div>
        </div>
    );
};

export default BioreactorBOT;
