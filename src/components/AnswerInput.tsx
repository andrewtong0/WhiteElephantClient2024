import React, { useEffect, useState } from 'react';
import { Button, Grid, Input, Slider, TextField } from '@mui/material';
import { RANDOM_QUIPS } from './constants';

interface AnswerInputProps {
  gamedata: any;
  handleSubmit: (newAnswer: any) => void;
}

const AnswerInput = ({ gamedata, handleSubmit }: AnswerInputProps) => {
  const { currQuestion } = gamedata;
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answer, setAnswer] = useState<number | string | null>(null);
  const [quipText, setQuipText] = useState('');
  const [quipImgSrc, setQuipImgSrc] = useState('');

  useEffect(() => {
    setAnswer("");
    getRandomQuip();
  }, [])

  const getRandomQuip = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_QUIPS.length);
    // const randomIndex = RANDOM_QUIPS.length - 1;
    setQuipText(RANDOM_QUIPS[randomIndex].text);
    setQuipImgSrc(RANDOM_QUIPS[randomIndex].img);
  }

  const handleAnswerSubmit = () => {
    handleSubmit(answer);
    setAnswerSubmitted(true);
    getRandomQuip();
  };

  const handleSubmitWithValue = (value: any) => {
    handleSubmit(value);
    setAnswerSubmitted(true);
    getRandomQuip();
  }

  return (
    <div>
      {
        !answerSubmitted ? (
          <>
            {currQuestion.questionType === 'multiple_choice' &&(
              <MultipleChoiceQuestion
                setAnswer={setAnswer}
                handleSubmit={handleSubmitWithValue}
                options={currQuestion.potentialAnswers}
              />
            )}

            {currQuestion.questionType === 'numeric' && (
              <NumericQuestion gamedata={gamedata} answer={answer} setAnswer={setAnswer} handleSubmit={handleAnswerSubmit} />
            )}

            {currQuestion.questionType === 'survey' && (
              <NumericQuestion gamedata={gamedata} answer={answer} setAnswer={setAnswer} handleSubmit={handleAnswerSubmit} />
            )}

            {currQuestion.questionType === 'survey_question' && (
              <NumericQuestion gamedata={gamedata} answer={answer} setAnswer={setAnswer} handleSubmit={handleAnswerSubmit} />
            )}
          </>
        ) :
        <div style={{ padding: "20px" }}>
          <h3 style={{ marginBottom: "50px" }}>
            Answer Submitted!
          </h3>
          {
            <div style={{ marginTop: "21px" }}>
              <div style={{ marginBottom: "10px", opacity: 0.5 }}>{quipText}</div>
              <img style={{ width: "120px"}} src={quipImgSrc} />
            </div>
          }
        </div>
      }

      {/* <button onClick={handleAnswerSubmit}>Submit Answer</button> */}
    </div>
  );
};

interface MultipleChoiceProps {
  options: string[];
  setAnswer: (value: string) => void;
  handleSubmit: (value: any) => void;
}

const MultipleChoiceQuestion = ({
  options,
  setAnswer,
  handleSubmit,
}: MultipleChoiceProps) => (
  <>
    {options.map((option, index) => (
      <div key={index}>
        <Button
          onClick={() => {
            setAnswer(option);
            handleSubmit(option);
          }}
          variant="contained"
          fullWidth
          style={{ marginTop: "5px" }}
        >
          {option}
        </Button>
      </div>
    ))}
  </>
);

interface NumericProps {
  gamedata: any;
  answer: number | string | null;
  setAnswer: (value: number) => void;
  handleSubmit: () => void;
}

const NumericQuestion = ({ gamedata, answer, setAnswer, handleSubmit }: NumericProps) => {
  const lowerBound = gamedata.currQuestion?.potentialAnswers?.start || 0;
  const upperBound = gamedata.currQuestion?.potentialAnswers?.end || 0;

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setAnswer(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    if (typeof answer === 'number') {
      if (answer < lowerBound) setAnswer(lowerBound);
      else if (answer > upperBound) setAnswer(upperBound);
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <Slider
        value={typeof answer === 'number' ? answer : 0}
        onChange={handleSliderChange}
        aria-labelledby="input-slider"
        min={lowerBound}
        max={upperBound}
      />
      <div>
        <div style={{ opacity: 0.7, fontSize: "14px", marginBottom: "10px" }}>
          (You can type your answer below instead of using the slider for higher granularity)
        </div>
        <TextField
          value={answer}
          size="small"
          onChange={handleInputChange}
          onBlur={handleBlur}
          inputProps={{
            step: 1,
            min: lowerBound,
            max: upperBound,
            type: 'number',
            'aria-labelledby': 'input-slider',
            style: { textAlign: "center" }
          }}
          fullWidth
        />
      </div>
      <Button variant="contained" onClick={handleSubmit} fullWidth style={{ marginTop: "10px" }}>
        Submit Answer
      </Button>
    </div>
  );
};

export default AnswerInput;
