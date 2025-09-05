export const selectRecentQuestionsByAuthor = (questions, authorId, limit = 5) => {
  if (!Array.isArray(questions)) return [];
  if (!authorId) return [];

  return questions
    .filter((question) => question?.author?.id === authorId)
    .slice(0, limit);
};

export const selectRecentAnswersByAuthor = (questions, authorId, limit = 5) => {
  if (!Array.isArray(questions)) return [];
  if (!authorId) return [];

  return questions
    .flatMap((q) => (q.answers || []).map((a) => ({
      ...a,
      questionTitle: q.title,
      questionId: q.id,
    })))
    .filter((a) => a?.author?.id === authorId)
    .slice(0, limit);
};


