import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '../../../services/ai/messages';
import { conversationsApi } from '../../../services/ai/conversations';
import { useChatStore } from '../store/chatStore';
import { useNavigate } from 'react-router-dom';

export function useMessages(conversationId: string) {
  const setMessages = useChatStore((state) => state.setMessages);

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await messagesApi.list(conversationId);
      setMessages(response.data);
      return response.data;
    },
    enabled: !!conversationId,
  });
}

export function useSendMessage(module?: string) {
  const queryClient = useQueryClient();
  const { addMessage, setIsLoading, setCurrentConversationId } = useChatStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ conversationId, content, systemPrompt }: {
      conversationId: string | null;
      content: string;
      systemPrompt?: string;
    }) => {
      setIsLoading(true);

      let targetConversationId = conversationId;

      if (!targetConversationId) {
        const convResponse = await conversationsApi.create({ module: module || 'chat' });
        targetConversationId = convResponse.data.id;
        setCurrentConversationId(targetConversationId);
        if (module) {
          navigate(`/ai/${module}/${targetConversationId}`, { replace: true });
        } else {
          navigate(`/ai/chat/${targetConversationId}`, { replace: true });
        }
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }

      const response = await messagesApi.send(targetConversationId!, content, systemPrompt);
      return { response, conversationId: targetConversationId! };
    },
    onSuccess: (data) => {
      addMessage(data.response.data.user_message);
      addMessage(data.response.data.assistant_message);
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });
}
