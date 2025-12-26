import TextInput from "../components/TextInput";

export default function HomePage() {
  return (
    <div className="bg-primary-500">
      <h1 className="text-primary-600 text-2xl">
        Hello World
        <TextInput></TextInput>
      </h1>
    </div>
  );
}
