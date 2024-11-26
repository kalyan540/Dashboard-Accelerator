from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import time
import asyncio
import websockets
import logging

# Load the model and tokenizer
model_path = 'gaussalgo/T5-LM-Large-text2sql-spider'
model = AutoModelForSeq2SeqLM.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)

# Database schema
schema = """
   "stadium" "Stadium_ID" int , "Location" text , "Name" text , "Capacity" int , "Highest" int , "Lowest" int , "Average" int , foreign_key:  primary key: "Stadium_ID" [SEP] "singer" "Singer_ID" int , "Name" text , "Country" text , "Song_Name" text , "Song_release_year" text , "Age" int , "Is_male" bool , foreign_key:  primary key: "Singer_ID" [SEP] "concert" "concert_ID" int , "concert_Name" text , "Theme" text , "Year" text , foreign_key: "Stadium_ID" text from "stadium" "Stadium_ID" , primary key: "concert_ID" [SEP] "singer_in_concert"  foreign_key: "concert_ID" int from "concert" "concert_ID" , "Singer_ID" text from "singer" "Singer_ID" , primary key: "concert_ID" "Singer_ID"
"""

# Set up logging
logging.basicConfig(level=logging.INFO)

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

        # Print the time taken (for logging)
        print(f"Time taken: {end_time - start_time:.2f} seconds\n")
        return generated_sql
    except Exception as e:
        return f"An error occurred: {e}"

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

async def main():
    # Create the WebSocket server
    server = await websockets.serve(echo, "0.0.0.0", 8765)
    logging.info("WebSocket Server running on ws://0.0.0.0:8765")

    # Keep the server running indefinitely
    await server.wait_closed()

if __name__ == "__main__":
    # Run the WebSocket server
    asyncio.run(main())
