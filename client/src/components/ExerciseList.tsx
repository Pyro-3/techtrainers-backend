interface ExerciseListProps {
  exercises: Array<{id: string, title: string, videoUrl: string}>; // Add this
  onExerciseClick: (title: string, videoUrl: string) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises, // Add this
  onExerciseClick,
}) => {
  return (
    <ul>
      {exercises.map(ex => (
        <li key={ex.id} onClick={() => onExerciseClick(ex.title, ex.videoUrl)}>
          {ex.title}
        </li>
      ))}
    </ul>
  );
};