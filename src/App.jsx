import React, { useState, useEffect } from "react";
const omdb_Key = import.meta.env.VITE_omdb_Key;
import "@copilotkit/react-ui/styles.css";
import { MessagesSquare, Film, History, ThumbsUp } from "lucide-react";

import { useCopilotChat, useCopilotReadable } from "@copilotkit/react-core";
import { useCopilotAction } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotPopup } from "@copilotkit/react-ui";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Backend API service

const MovieRecommender = () => {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsWithPosters, setRecommendationsWithPosters] = useState(
    []
  );
  const [prevhistory, setPrevhistory] = useState("");

  const genres = [
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Romance",
    "Science Fiction",
    "Thriller",
    "Documentary",
  ];

  const moods = [
    "Happy",
    "Relaxed",
    "Excited",
    "Thoughtful",
    "Romantic",
    "Mysterious",
    "Inspired",
  ];
  useCopilotReadable({
    description: "The movie genre selected by the user for the movie",
    value: selectedGenre,
  });
  useCopilotReadable({
    description: "The mood for the movie selected by the user",
    value: selectedMood,
  });
  useCopilotReadable({
    description: "The history of movies watched by the user",
    value: prevhistory,
  });
  useCopilotReadable({
    description: "The movies recommended by copilotKit",
    value: recommendations,
  });

  useCopilotAction({
    name: "Suggest Movies",
    description:
      "Recommend movies based on the selected genre, mood, and previous history",
    parameters: [
      {
        name: "MovieDetails",
        type: "object[]",
        description: "Provide movie name, year, and IMDb rating",
        attributes: [
          { name: "name", type: "string", description: "Name of the movie" },
          {
            name: "description",
            type: "string",
            description: "Description of the movie",
          },
          {
            name: "imbdRating",
            type: "string",
            description: "rating given by IMDb",
          },
          {
            name: "year",
            type: "string",
            description: "year of release",
          },
        ],
      },
    ],
    // handler: ({ MovieDetails }) => setRecommendations([MovieDetails]),
    handler: ({ MovieDetails }) =>
      setRecommendations((prev) => [...prev, ...MovieDetails]),
  });
  const {
    visibleMessages, // An array of messages that are currently visible in the chat.
    appendMessage, // A function to append a message to the chat.
    setMessages, // A function to set the messages in the chat.
    deleteMessage, // A function to delete a message from the chat.
    reloadMessages, // A function to reload the messages from the API.
    stopGeneration, // A function to stop the generation of the next message.
    isLoading, // A boolean indicating if the chat is loading.
  } = useCopilotChat();
  const getPoster = async (name, year) => {
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${omdb_Key}&s=${name}&y=${year}`
      );
      const data = await response.json();
      return data?.Search?.[0]?.Poster || "";
    } catch (error) {
      console.error("Error fetching movie poster:", error);
      return "";
    }
  };
  const handleGetRecommendations = async () => {
    try {
      const prompt = `Recommend movies based on the selected genre (${selectedGenre}), mood (${selectedMood}), and previous watch history:${prevhistory} (Atlease suggest 3 Movies).`;
      appendMessage(new TextMessage({ content: prompt, role: Role.User }));
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };
  useEffect(() => {
    console.log("rendered");
    const fetchPosters = async () => {
      const updatedRecommendations = await Promise.all(
        recommendations.map(async (movie) => {
          const posterUrl = await getPoster(movie.name, movie.year);
          return { ...movie, posterUrl };
        })
      );
      setRecommendationsWithPosters(updatedRecommendations);
    };

    if (recommendations.length > 0) {
      fetchPosters();
    }
  }, [recommendations]);
  return (
    <div className="relative min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-6 w-6" />
              Movie Recommendation Bot
            </CardTitle>
            <CardDescription>
              Get personalized movie recommendations based on your preferences
              or chat with our AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Genre</label>
                  <Select onValueChange={setSelectedGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre.toLowerCase()}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mood</label>
                  <Select onValueChange={setSelectedMood}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {moods.map((mood) => (
                        <SelectItem key={mood} value={mood.toLowerCase()}>
                          {mood}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div></div>
              </div>
              <div>
                <Label htmlFor="previous">Previous Watched</Label>
                <Input
                  id="previous"
                  value={prevhistory}
                  onChange={(e) => setPrevhistory(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleGetRecommendations}
                disabled={!selectedGenre && !selectedMood}
              >
                Get Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>

        {recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendationsWithPosters.map((movie, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    {movie.name}
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {movie.imbdRating}/10
                    </span>
                  </CardTitle>

                  <CardDescription>{movie.year}</CardDescription>
                </CardHeader>
                <CardContent>
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={`${movie.name} poster`} />
                  ) : (
                    <p>No poster available</p>
                  )}
                  <p className="text-sm text-gray-600">{movie.description}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Like
                    </Button>
                    <Button variant="outline" size="sm">
                      <History className="h-4 w-4 mr-2" />
                      Add to History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <CopilotChat
        instructions={`You are a knowledgeable movie recommendation assistant. Help users find movies based on their preferences, mood, and interests. You can:
        1. Recommend 5 movies based on genre, mood, or similar movies they've enjoyed
        2. Provide movie details and reviews
        3. Explain why you're recommending specific movies
        4. Answer questions about actors, directors, and movie trivia`}
        labels={{
          title: "Your Assistant",
          initial: "Hi! 👋 You may ask me for doubts or suggestions ?",
        }}
      />
    </div>
  );
};

export default MovieRecommender;
