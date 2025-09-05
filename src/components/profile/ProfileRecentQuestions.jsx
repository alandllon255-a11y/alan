import React, { useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { selectRecentQuestionsByAuthor } from '../../selectors/profileSelectors';

const ProfileRecentQuestions = ({ questions, profileUserId, onOpenQuestion }) => {
  const recentQuestions = useMemo(
    () => selectRecentQuestionsByAuthor(questions, profileUserId, 5),
    [questions, profileUserId]
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-purple-500" /> Perguntas Recentes
      </h3>
      <div className="space-y-4">
        {recentQuestions.map(question => (
          <div
            key={question.id}
            className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
            onClick={() => onOpenQuestion(question)}
          >
            <h4 className="text-white font-medium mb-2">{question.title}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>⬆ {question.votes} votos</span>
              <span>💬 {question.answers.length} respostas</span>
              <span>👁 {question.views} visualizações</span>
            </div>
          </div>
        ))}
        {recentQuestions.length === 0 && (
          <p className="text-gray-400 text-center py-4">Nenhuma pergunta ainda</p>
        )}
      </div>
    </div>
  );
};

export default ProfileRecentQuestions;

