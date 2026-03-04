export function drawWaveform(
  ctx: CanvasRenderingContext2D,
  analyser: AnalyserNode,
  width: number,
  height: number
): void {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  // Draw waveform in the lower third of the screen
  const yOffset = height * 0.65;
  const drawHeight = height * 0.3;

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(0, 255, 100, 0.5)';
  ctx.lineWidth = 2;

  const sliceWidth = width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = yOffset + (v - 1) * drawHeight;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  ctx.stroke();
}

export function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  analyser: AnalyserNode,
  width: number,
  height: number
): void {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  // Draw spectrum bars at the bottom
  const barCount = 64;
  const barWidth = width / barCount;
  const step = Math.floor(bufferLength / barCount);

  for (let i = 0; i < barCount; i++) {
    const value = dataArray[i * step];
    const barHeight = (value / 255) * height * 0.25;
    const x = i * barWidth;
    const y = height - barHeight;

    ctx.fillStyle = `rgba(0, 255, 255, ${0.15 + (value / 255) * 0.4})`;
    ctx.fillRect(x, y, barWidth - 1, barHeight);
  }
}
