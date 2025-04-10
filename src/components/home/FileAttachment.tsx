import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";

interface FileAttachmentProps {
  onChange?: (files: FileList) => void;
}

export default function FileAttachment({ onChange }: FileAttachmentProps) {
  return (
    <>
      <Label>Attach File</Label>
      <Input
        type="file"
        accept="application/json"
        onChange={(event) => {
          if (event.target.files && onChange)
            onChange(event.target.files)
        }}
      />
    </>
  )
}