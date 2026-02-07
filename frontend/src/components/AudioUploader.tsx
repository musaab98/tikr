interface AudioUploaderProps {
  onUpload: (file: File) => void;
}

export function AudioUploader({ onUpload }: AudioUploaderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="audio-uploader">
      <label htmlFor="audio-upload" className="upload-btn">
        📁 Upload Audio
      </label>
      <input
        id="audio-upload"
        type="file"
        accept="audio/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
