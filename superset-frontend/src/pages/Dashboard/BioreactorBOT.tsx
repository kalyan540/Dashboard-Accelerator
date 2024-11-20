import React, { useState } from "react";
import Chatbot from './Chatbot.png';
import { nanoid } from 'nanoid';
import Send from './send.png';
import { useID } from 'src/views/idOrSlugContext';
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

    const { embedchart } = useID();

    const suggestions = [
        "Which is the best bioreactor in terms of performance?",
        "Which plant has the best productivity?",
        "Which bioreactor is less in use?",
    ];

    const tempTable="";
    const ctas=false;
    const sqlquery = {
        id: nanoid(11),
        dbId: 1,
        sql: "SELECT \r\n    bioreactor_name, \r\n    COUNT(*) AS usage_count \r\nFROM \r\n    \"WorldpharmaData\"  \r\nWHERE \r\n    availability < 100 -- Assuming 100% availability means fully operational\r\nGROUP BY \r\n    bioreactor_name \r\nORDER BY \r\n    usage_count ASC \r\nLIMIT 4;\r\n",
        sqlEditorId: "1",
        tab: "Untitled Query 1",
        schema: "public",
        tempTable,
        queryLimit: 100000,
        runAsync: false,
        ctas,
        ctas_method: "TABLE",
    };
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

    const handleSuggestionClick = (suggestion: string, index: number) => {
        setQuery(suggestion); // Set the clicked suggestion to the input
        //setCurrentIndex(index);
        setShowSuggestions(false); // Hide suggestions after selection
    };

    const handleSubmit = () => {
        // Set the index based on the current query
        console.log(runQuery(sqlquery));
        const matchedIndex = suggestions.findIndex(suggestion =>
            suggestion.toLowerCase() === query.toLowerCase()
        );
        if (matchedIndex !== -1) {
            setCurrentIndex(matchedIndex); // Set the iframe to the correct chart
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
                                    {suggestion}
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
                {currentIndex !== null && embedchart[currentIndex] && (
                    <iframe
                        src={embedchart[currentIndex]} // Replace with the desired URL
                        title="Chart Representation"
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            borderRadius: "5px",
                        }}
                    />)}
            </div>
        </div>
    );
};

export default BioreactorBOT;