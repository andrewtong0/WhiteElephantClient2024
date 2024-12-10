import React from 'react';
import { Button, Slider } from '@mui/material';

interface BettingInputProps {
  numPoints: number;
  handleWagerSubmit: (pointWager: number) => void;
}

const BettingInput: React.FC<BettingInputProps> = ({ numPoints, handleWagerSubmit }) => {
  const [value, setValue] = React.useState<number>(0);
  const [wagerConfirmed, setWagerConfirmed] = React.useState<boolean>(false);

  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  return (
    <>
      {
        wagerConfirmed ?
          <div>You've wagered {value} points</div> :
          <div>
            <div>{`Available Points: ${numPoints}`}</div>
            <div>{`Current Wager: ${value}`}</div>
          </div>
      }

      {
        numPoints > 0 ?
          <div>
            { !wagerConfirmed &&
              <div>
                <Slider
                  value={value}
                  min={0}
                  max={numPoints}
                  onChange={handleChange}
                />
                {
                  !wagerConfirmed &&
                    <Button
                      variant="contained"
                      onClick={() => {
                        setWagerConfirmed(true);
                        handleWagerSubmit(value);
                      }}
                    >
                      Confirm Wager
                    </Button>
                }
              </div>
            }
          </div> :
          <div style={{ fontSize: "16px" }}>Well, this is awkward... You have no points to wager... But you can still answer the question if you'd like!</div>
      }
    </>
  );
};

export default BettingInput;
