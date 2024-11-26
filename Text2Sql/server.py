import re
import time
import asyncio
import websockets
import logging
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

# Load the model and tokenizer
model_path = 'gaussalgo/T5-LM-Large-text2sql-spider'
model = AutoModelForSeq2SeqLM.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)

# Database schema (unchanged, used for model input)
schema = """
"USA_OEE" 
  "timestamp" STRING, 
  "device_name" STRING, 
  "Quality" FLOAT, 
  "Performance" FLOAT, 
  "Availability" FLOAT, 
  "OEE" FLOAT, 
  foreign_key:  
  primary key: "timestamp"
"""

# Table names and column names
table_names = ["USA_OEE"]  # Table names in the schema
column_names = ["timestamp", "device_name", "Quality", "Performance", "Availability", "OEE"]  # Column names in the schema

# Function to add double quotations to table and column names in the SQL query
def add_double_quotations(sql_query, table_names, column_names):
    """
    Add double quotations to table and column names in the SQL query.
    :param sql_query: Input SQL query string
    :param table_names: List of table names
    :param column_names: List of column names
    :return: Formatted SQL query
    """
    # Create a mapping of lowercase schema elements to original elements for case-insensitive matching
    table_map = {table.lower(): f'public."{table}"' for table in table_names}
    column_map = {col.lower(): f'"{col}"' for col in column_names}

    # Split the query into words and replace matches
    words = sql_query.split()
    for i, word in enumerate(words):
        stripped_word = re.sub(r'[^\w]', '', word)  # Remove non-alphanumeric characters for matching
        if stripped_word.lower() in table_map:
            # Replace the table name with the formatted version
            words[i] = word.replace(stripped_word, table_map[stripped_word.lower()])
        elif stripped_word.lower() in column_map:
            # Replace the column name with the double-quoted version
            words[i] = word.replace(stripped_word, column_map[stripped_word.lower()])
    return " ".join(words)

# Function to generate SQL query from the question using the transformer model
def generate_sql_query(question):
    # Combine question with schema
    input_text = " ".join(["Question: ", question, "Schema:", schema])

    try:
        # Start the timer
        start_time = time.time()

        # Tokenize the input and generate the output
        model_inputs = tokenizer(input_text, return_tensors="pt")
        outputs = model.generate(**model_inputs, max_length=512)

        # Stop the timer
        end_time = time.time()

        # Decode and return the SQL query
        output_text = tokenizer.batch_decode(outputs, skip_special_tokens=True)
        generated_sql = output_text[0]

        # Add double quotations to table and column names
        formatted_sql = add_double_quotations(generated_sql, table_names, column_names)

        # Print the time taken (for logging)
        print(f"Time taken: {end_time - start_time:.2f} seconds\n")
        return formatted_sql
    except Exception as e:
        return f"An error occurred: {e}"

# Set up logging
logging.basicConfig(level=logging.INFO)

# WebSocket handler that processes questions and returns SQL
async def echo(websocket):
    logging.info(f"New connection from {websocket.remote_address}")
    try:
        async for message in websocket:
            logging.info(f"Received message: {message}")
            # Call the function to generate SQL query from the question
            sql_query = generate_sql_query(message)
            await websocket.send(sql_query)
    except websockets.exceptions.ConnectionClosed as e:
        logging.error(f"Connection closed: {e}")

# WebSocket server function
async def main():
    # Create the WebSocket server
    server = await websockets.serve(echo, "0.0.0.0", 8765)
    logging.info("WebSocket Server running on ws://0.0.0.0:8765")

    # Keep the server running indefinitely
    await server.wait_closed()

if __name__ == "__main__":
    # Run the WebSocket server
    asyncio.run(main())
