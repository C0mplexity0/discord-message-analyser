import FileAttachment from "./components/home/FileAttachment";

export default function App() {
  return (
    <main className="size-full">
      <FileAttachment
        onChange={async (files) => {
          const file = files[0];

          if (!file) {
            return;
          }

          const content = JSON.parse(await file.text());
          
          console.log(content);
        }}
      />
    </main>
  )
}
