import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import WaveSurfer from 'wavesurfer.js';
import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';

const PlayerContainer = styled.div`
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 12px 20px;
  margin: 8px 0;
  min-width: 220px;
  max-width: 350px;
`;

// Uodating Chat.jsx Logic to en

const PlayButton = styled.button`
  background: #f0f2f5;
  color: #4e8cff;
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  cursor: pointer;
`;

const WaveformContainer = styled.div`
  flex: 1;
  height: 40px;
  min-width: 120px;
  margin-right: 16px;
  display: flex;
  align-items: center;
`;

const Duration = styled.span`
  font-size: 15px;
  color: #333;
  min-width: 38px;
  text-align: right;
`;

const FileTypeBadge = styled.span`
  background: #4e8cff;
  color: #fff;
  font-size: 11px;
  border-radius: 6px;
  padding: 2px 8px;
  margin-left: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SpeedButton = styled.button`
  background: #f0f2f5;
  border: none;
  border-radius: 8px;
  color: #4e8cff;
  font-weight: 600;
  font-size: 13px;
  margin-left: 10px;
  padding: 2px 8px;
  cursor: pointer;
`;

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const speedOptions = [1, 1.5, 2];

const VoiceNotePlayer = ({ src, fileType }) => {
  const waveformRef = useRef();
  const wavesurfer = useRef();
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [audioError, setAudioError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Defensive: Don't render if no src
  if (!src) {
    return <div>No audio source available.</div>;
  }

  useEffect(() => {
    setAudioError(null); // Reset error on src change
    if (waveformRef.current && src) {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#b3d1ff',
        progressColor: '#4e8cff',
        cursorColor: '#4e8cff',
        barWidth: 2,
        barRadius: 2,
        responsive: true,
        height: 40,
        normalize: true,
        partialRender: true,
        interact: true,
        hideScrollbar: true,
      });
      wavesurfer.current.load(src);

      // Error handling
      wavesurfer.current.on('error', (e) => {
        console.error('WaveSurfer error:', e);
        setAudioError('Audio could not be played. The file may be missing or unsupported.');
      });

      wavesurfer.current.on('ready', () => {
        setDuration(wavesurfer.current.getDuration());
      });
      wavesurfer.current.on('audioprocess', () => {
        setCurrent(wavesurfer.current.getCurrentTime());
      });
      wavesurfer.current.on('seek', () => {
        setCurrent(wavesurfer.current.getCurrentTime());
      });
      wavesurfer.current.on('finish', () => {
        setPlaying(false);
        setCurrent(0);
      });
    }
    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [src]);

  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current.setPlaybackRate(speedOptions[speedIdx]);
    }
  }, [speedIdx]);

  const handlePlayPause = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (!playing) {
        await wavesurfer.current.play();
        setPlaying(true);
      } else {
        wavesurfer.current.pause();
        setPlaying(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeed = () => {
    setSpeedIdx((speedIdx + 1) % speedOptions.length);
  };

  if (audioError) {
    return <div style={{ color: 'red' }}>{audioError}</div>;
  }

  return (
    <PlayerContainer>
      <PlayButton onClick={handlePlayPause} disabled={isLoading}>
        {playing ? <FaPause /> : <FaPlay />}
      </PlayButton>
      <WaveformContainer ref={waveformRef} />
      <Duration>{formatTime(duration)}</Duration>
      <SpeedButton onClick={handleSpeed}>{speedOptions[speedIdx]}x</SpeedButton>
      {fileType && (
        <FileTypeBadge>
          <FaVolumeUp size={12} />
          {fileType.split('/').pop()}
        </FileTypeBadge>
      )}
    </PlayerContainer>
  );
};

export default VoiceNotePlayer; 


