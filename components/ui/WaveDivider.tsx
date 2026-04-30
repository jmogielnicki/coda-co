interface WaveDividerProps {
  topColor: string;
  bottomColor: string;
}

export function WaveDivider({ topColor, bottomColor }: WaveDividerProps) {
  return (
    <div style={{ background: topColor }} className="pb-[60px] -mb-[60px]">
      <div className="arc-top h-[60px]" style={{ background: bottomColor }} />
    </div>
  );
}
