import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, Button } from '@mui/material';

interface SelectPositionProps {
  gamedata: any,
  handleSubmit: (selectedPosition: number) => void;
  numPlayers: number;
  isPlayersTurn: boolean;
}

const SelectPosition: React.FC<SelectPositionProps> = ({ gamedata, handleSubmit, numPlayers, isPlayersTurn }) => {
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);

  useEffect(() => {
    gamedata.positions.selectOrder.forEach((position: any) => {
      setSelectedPositions((prevPositions) => [...prevPositions, position.position]);
    })
  }, [gamedata])

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {
          isPlayersTurn ?
            "You're up! Select what position you want to go for the White Elephant!" :
            selectedPosition === null ?
              "Waiting for your turn..." :
              'You will be picking in position ' + selectedPosition
        }
      </Typography>
        {Array.from({ length: numPlayers }).map((_, i) => (
          <div style={{ margin: "20px" }}>
            <Button
              variant={selectedPosition === i + 1 ? 'contained' : 'outlined'}
              onClick={() => {
                const selectedPosition = i + 1
                setSelectedPosition(selectedPosition)
                handleSubmit(selectedPosition)
              }}
              fullWidth
              style={{ outline: selectedPositions.includes(i + 1) ? '2px solid red' : '' }}
              disabled={!isPlayersTurn || selectedPositions.includes(i + 1)}

            >
              {i + 1}
            </Button>
            </div>
        ))}
    </Box>
  );
};

export default SelectPosition;
