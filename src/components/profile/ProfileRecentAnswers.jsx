import React, { useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import { selectRecentAnswersByAuthor } from '../../selectors/profileSelectors';

const ProfileRecentAnswers = ({ questions, profileUserId, onOpenQuestionById }) => {
  const recentAnswers = useMemo(
    () => selectRecentAnswersByAuthor(questions, profileUserId, 5),
    [questions, profileUserId]
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-500" /> Respostas Recentes
      </h3>
      <div className="space-y-4">
        {recentAnswers.map(answer => (
          <div
            key={answer.id}
            className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
            onClick={() => onOpenQuestionById(answer.questionId)}
          >
            <p className="text-sm text-gray-400 mb-2">Em resposta a: {answer.questionTitle}</p>
            <p className="text-white line-clamp-2">{answer.content}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
              <span>⬆ {answer.votes} votos</span>
              {answer.isAccepted && <span className="text-green-500">✅ Aceita</span>}
            </div>
          </div>
        ))}
        {recentAnswers.length === 0 && (
          <p className="text-gray-400 text-center py-4">Nenhuma resposta ainda</p>
        )}
      </div>
    </div>
  );
};

export default ProfileRecentAnswers;

