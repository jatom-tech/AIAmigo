import requests

def fetch_random_joke():
    """
    Fetches a random joke from the Official Joke API and displays it.
    """
    try:
        # Make a GET request to the API
        response = requests.get("https://official-joke-api.appspot.com/random_joke")
        response.raise_for_status()  # Raise an error for bad response codes
        joke = response.json()

        # Print the joke
        print("Here's a random joke:")
        print(f"{joke['setup']}")
        print(f"{joke['punchline']}")
    
    except requests.exceptions.RequestException as e:
        print("An error occurred while fetching the joke:", e)

if __name__ == "__main__":
    fetch_random_joke()