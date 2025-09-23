export const Error = ({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">{title || "Something went wrong"}</h1>
      <p className="mt-2">{description || "Please try again later."}</p>
    </div>
  );
};
