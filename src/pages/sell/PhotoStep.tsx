import { useRef, useState } from "react";
import { Icon } from "../../components/ui";
import { fileToResizedDataUrl } from "../../utils/images";
import { MAX_PHOTOS } from "../../utils/sellForm";

/**
 * Step 1 of the sell form: upload photos.
 * - Click the zone (or press Enter/Space on it) or drag photos onto it
 * - Up to MAX_PHOTOS photos; the first one is the main photo
 * - Each photo can be removed or made the main photo
 */
export function PhotoStep({
  photos,
  onChange,
  error,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const spaceLeft = MAX_PHOTOS - photos.length;

  const addFiles = async (files: FileList | File[]) => {
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      setUploadError("Only image files can be added.");
      return;
    }
    const toAdd = images.slice(0, spaceLeft);
    setBusy(true);
    setUploadError(
      images.length > spaceLeft ? `You can add at most ${MAX_PHOTOS} photos.` : "",
    );
    try {
      const urls = await Promise.all(toAdd.map((f) => fileToResizedDataUrl(f)));
      onChange([...photos, ...urls]);
    } catch {
      setUploadError("One of the photos could not be read. Try another file.");
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = (index: number) => onChange(photos.filter((_, i) => i !== index));

  const makeMain = (index: number) =>
    onChange([photos[index], ...photos.filter((_, i) => i !== index)]);

  const openPicker = () => {
    if (spaceLeft > 0) inputRef.current?.click();
  };

  return (
    <>
      <p className="lead">Good photos sell faster. Add up to {MAX_PHOTOS} photos.</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) void addFiles(e.target.files);
          e.target.value = ""; // allow picking the same file again
        }}
      />

      <div
        className={`upload-zone${dragging ? " dragging" : ""}${spaceLeft === 0 ? " full" : ""}`}
        role="button"
        tabIndex={spaceLeft > 0 ? 0 : -1}
        aria-disabled={spaceLeft === 0}
        aria-describedby={error ? "photos-error" : undefined}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (spaceLeft > 0) void addFiles(e.dataTransfer.files);
        }}
      >
        <span>
          <Icon name="camera" size={32} />
        </span>
        <h3>{spaceLeft > 0 ? "Click or drag photos here" : "Maximum number of photos reached"}</h3>
        <p>
          JPG or PNG · {photos.length} / {MAX_PHOTOS} photos
        </p>
        {busy && <small>Processing photos…</small>}
      </div>

      {(error || uploadError) && (
        <p className="field-error" id="photos-error" role="alert">
          {uploadError || error}
        </p>
      )}

      {photos.length > 0 && (
        <ul className="photo-preview" aria-label="Added photos">
          {photos.map((src, index) => (
            <li key={`${index}-${src.slice(-16)}`}>
              <img src={src} alt={index === 0 ? "Main photo" : `Photo ${index + 1}`} />
              {index === 0 ? (
                <span>Main photo</span>
              ) : (
                <button
                  type="button"
                  className="photo-main-btn"
                  onClick={() => makeMain(index)}
                  aria-label={`Make photo ${index + 1} the main photo`}
                >
                  Make main
                </button>
              )}
              <button
                type="button"
                className="photo-remove-btn"
                onClick={() => removePhoto(index)}
                aria-label={`Remove photo ${index + 1}`}
              >
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="tip">
        <b>Photo tip</b>
        <p>Use daylight and photograph your item from several angles.</p>
      </div>
    </>
  );
}
