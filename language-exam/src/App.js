import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  Container,
  Paper,
  CircularProgress,
  LinearProgress,
  CssBaseline,
  Tooltip,
  Box,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ThemeProvider } from "@mui/material/styles";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Rating from "@mui/material/Rating";
import { styled } from "@mui/system";
import theme from "./theme";
import Character from "./character";
import "./App.css";

// Define custom styles using the styled API
const QuestionText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Poetsen One', sans-serif",
  color: "#ffffff",
}));

const CustomPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  backgroundColor: "#1d1d1d",
  color: "#ffffff",
}));

const CustomFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  fontFamily: "'Poetsen One', sans-serif",
  color: "#ffffff",
}));

const apiUrl = "https://3016-68-81-204-54.ngrok-free.app";

const TOTAL_QUESTIONS = 10;
const TIME_LIMIT = 480; // 5 minutes in seconds

function App() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [ratings, setRatings] = useState({});
  const [difficulty, setDifficulty] = useState("TOEFL Basic");

  useEffect(() => {
    let timer;
    if (quizStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining <= 0) {
      handleSubmitExam();
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining]);

  const startQuiz = async () => {
    setQuizStarted(true);
    generateQuestion();
  };

  const correctRate =
    results.length > 0
      ? (results.filter((r) => r.isCorrect).length / results.length) * 100
      : 0;

  const generateQuestion = async () => {
    setLoading(true);
    try {
      const prompt = `Create a ${difficulty.toLowerCase()} language question with options and the correct answer. Format: 'Question: ..., Options: a) ..., b) ..., c) ..., d) ..., Correct Answer: ...', no extra words or explanation just show this question`;
      const response = await axios.post(`${apiUrl}/generate-question`, {
        prompt,
      });
      const resultString = response.data.content;

      const questionMatch = resultString.match(/Question: (.+?)\sOptions:/);
      const optionsMatch = resultString.match(
        /Options: (.+?)\sCorrect Answer:/
      );
      const correctAnswerMatch = resultString.match(/Correct Answer: (.+)/);

      if (questionMatch && optionsMatch && correctAnswerMatch) {
        const Question = questionMatch[1].trim();
        const Options = optionsMatch[1]
          .split(", ")
          .map((opt) => opt.replace(/,\s*$/, "").trim());
        const CorrectAnswer = correctAnswerMatch[1].trim();

        setQuestion(Question);
        setOptions(Options);
        setCorrectAnswer(CorrectAnswer);
        setFeedback("");
        setUserAnswer("");
        setCurrentQuestionNumber((prev) => prev + 1);
      } else {
        console.error("Error parsing the response:", resultString);
      }
    } catch (error) {
      console.error("Error generating question:", error);
    }
    setLoading(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const isCorrect = userAnswer === correctAnswer;
    setResults((prevResults) => [
      ...prevResults,
      {
        id: currentQuestionNumber,
        question,
        userAnswer,
        correctAnswer,
        isCorrect,
      },
    ]);
    setQuestionsAnswered((prev) => prev + 1);
    if (questionsAnswered < TOTAL_QUESTIONS - 1) {
      generateQuestion();
    } else {
      handleSubmitExam();
    }
    setFeedback(
      isCorrect
        ? "Correct!"
        : `Incorrect. The correct answer is ${correctAnswer}.`
    );
  };

  const handleSkip = () => {
    setResults((prevResults) => [
      ...prevResults,
      {
        id: currentQuestionNumber,
        question,
        userAnswer: "Skipped",
        correctAnswer,
        isCorrect: false,
      },
    ]);
    setQuestionsAnswered((prev) => prev + 1);
    if (questionsAnswered < TOTAL_QUESTIONS - 1) {
      generateQuestion();
    } else {
      handleSubmitExam();
    }
  };

  const handleSubmitExam = () => {
    setShowResults(true);
    setQuizStarted(false);
  };

  const handleEndQuiz = () => {
    handleSubmitExam();
  };

  const handleRestart = () => {
    setShowResults(false);
    setQuizStarted(false);
    setResults([]);
    setQuestionsAnswered(0);
    setCurrentQuestionNumber(0);
    setTimeRemaining(TIME_LIMIT);
    setRatings({});
  };

  const handleRatingChange = (questionId, newValue) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [questionId]: newValue,
    }));
  };

  const columns = [
    { field: "question", headerName: "Question", width: 300 },
    { field: "userAnswer", headerName: "Your Answer", width: 150 },
    { field: "correctAnswer", headerName: "Correct Answer", width: 150 },
    {
      field: "isCorrect",
      headerName: "Result",
      width: 100,
      renderCell: (params) => (params.value ? "Correct" : "Incorrect"),
    },
    {
      field: "rating",
      headerName: "Rating",
      width: 150,
      renderCell: (params) => (
        <Rating
          name={`rating-${params.row.id}`}
          value={ratings[params.row.id] || 0}
          onChange={(event, newValue) =>
            handleRatingChange(params.row.id, newValue)
          }
        />
      ),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Tooltip title="designed by (Zayn) Zihan Huang" arrow>
          <div className="project-name" variant="h4" gutterBottom>
            FluentFlow
          </div>
        </Tooltip>
        <Character />
        <FormControl className="levels" fullWidth>
          <InputLabel id="difficulty-label">Difficulty</InputLabel>
          <Select
            labelId="difficulty-label"
            id="difficulty"
            value={difficulty}
            label="Difficulty"
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <MenuItem value="TOEFL Basic">TOEFL Basic</MenuItem>
            <MenuItem value="TOEFL Advanced">TOEFL Advanced</MenuItem>
            <MenuItem value="TOEFL Professional">TOEFL Professional</MenuItem>
            <MenuItem value="TOEFL Native">TOEFL Native</MenuItem>
          </Select>
        </FormControl>

        <div className="start-button">
          {!quizStarted && !showResults && (
            <Button variant="contained" color="primary" onClick={startQuiz}>
              Start Quiz
            </Button>
          )}
        </div>
        {quizStarted && (
          <div className="quiz-container">
            <Typography variant="subtitle1" className="timer">
              Time remaining: {Math.floor(timeRemaining / 60)}:
              {timeRemaining % 60 < 10
                ? `0${timeRemaining % 60}`
                : timeRemaining % 60}
            </Typography>
            <Typography variant="subtitle1" className="question-counter">
              Question {questionsAnswered + 1} of {TOTAL_QUESTIONS}
            </Typography>
            {loading ? (
              <>
                <LinearProgress
                // variant="buffer"
                // value={(questionsAnswered / TOTAL_QUESTIONS) * 100}
                // valueBuffer={
                //   ((questionsAnswered + 1) / TOTAL_QUESTIONS) * 100
                // }
                />
                <Stack spacing={1}>
                  <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="rectangular" width={210} height={60} />
                  <Skeleton variant="rounded" width={210} height={60} />
                </Stack>
              </>
            ) : (
              <CustomPaper elevation={3}>
                <QuestionText variant="h6">{question}</QuestionText>
                <form onSubmit={handleSubmit}>
                  <FormControl component="fieldset">
                    <RadioGroup
                      aria-label="quiz"
                      name="quiz"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                    >
                      {options.map((option, index) => (
                        <CustomFormControlLabel
                          key={index}
                          value={option}
                          control={<Radio />}
                          label={option}
                        />
                      ))}
                    </RadioGroup>
                    <div className="button-bar">
                      <Button type="submit" variant="contained" color="primary">
                        Submit Answer
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSkip}
                        style={{ marginLeft: "8px" }}
                      >
                        Skip Question
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleEndQuiz}
                        style={{
                          marginLeft: "8px",
                          backgroundColor: "#757575",
                          color: "#ffffff",
                        }}
                      >
                        End Quiz
                      </Button>
                    </div>
                  </FormControl>
                </form>
                {feedback && (
                  <Typography
                    variant="h6"
                    style={{
                      marginTop: "16px",
                      color: userAnswer === correctAnswer ? "green" : "red",
                    }}
                  >
                    {feedback}
                  </Typography>
                )}
              </CustomPaper>
            )}
          </div>
        )}
        {showResults && (
          <div className="result-container">
            <Typography variant="h4" gutterBottom>
              Quiz Results
            </Typography>
            <Box position="relative" display="inline-flex">
              <CircularProgress variant="determinate" value={correctRate} />
              <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  variant="caption"
                  component="div"
                  color="textSecondary"
                >
                  {`${Math.round(correctRate)}%`}
                </Typography>
              </Box>
            </Box>
            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={results}
                columns={columns}
                pageSize={10}
                className="result-table"
              />
            </div>
            <div className="result-summary">
              <Typography variant="h6" gutterBottom>
                Total Correct Answers:{" "}
                {results.filter((r) => r.isCorrect).length}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Total Incorrect Answers:{" "}
                {results.filter((r) => !r.isCorrect).length}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRestart}
              >
                Start Again
              </Button>
            </div>
          </div>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
