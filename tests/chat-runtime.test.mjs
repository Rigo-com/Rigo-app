import assert from "node:assert/strict";

import ChatRuntime from "../js/chat/chat-runtime/chat-runtime.js";
import ChatActions from "../js/chat/chat-actions/chat-actions.js";
import ChatMessageService from "../js/chat/chat-services/chat-message-service.js";
import ChatQueueService from "../js/chat/chat-services/chat-queue-service.js";
import ChatStreamService from "../js/chat/chat-services/chat-stream-service.js";
import ChatState from "../js/chat/chat-state/chat-state.js";
import { CHAT_LIMITS } from "../js/chat/chat-config.js";

assert.equal(ChatRuntime.id,"chat");
assert.equal(typeof ChatRuntime.initialize,"function");
assert.equal(typeof ChatRuntime.boot,"function");
assert.equal(typeof ChatRuntime.shutdown,"function");
assert.equal(typeof ChatRuntime.reset,"function");
assert.equal(typeof ChatRuntime.snapshot,"function");

assert.equal(ChatRuntime.initialize(),true);
assert.equal(ChatRuntime.status().initialized,true);

ChatState.setOwner("chat-test@example.com");
const conversation = ChatActions.createConversation({title:"Runtime test"});
assert.ok(conversation?.id);

const afterUser = ChatActions.appendConversationMessage(
  conversation.id,
  {role:"user",content:"hello"}
);
assert.equal(afterUser.messages.length,1);
assert.equal(ChatMessageService.getAll().length,1);
assert.equal(ChatMessageService.getAll()[0].id,afterUser.messages[0].id);

const mirrored = ChatActions.sendMessage({
  ...afterUser.messages[0],
  conversationId:conversation.id,
  userId:"chat-test@example.com"
});
assert.equal(mirrored.id,afterUser.messages[0].id);
assert.equal(ChatMessageService.getAll().length,1);

const afterAssistant = ChatActions.appendConversationMessage(
  conversation.id,
  {role:"assistant",content:"world"}
);
assert.equal(afterAssistant.messages.length,2);
assert.equal(ChatMessageService.getAll().length,2);
assert.equal(ChatStreamService.status().active,false);
assert.equal(ChatStreamService.status().status,"completed");

assert.throws(
  () => ChatActions.appendConversationMessage(
    conversation.id,
    {role:"user",content:"x".repeat(CHAT_LIMITS.MAX_MESSAGE_LENGTH + 1)}
  ),
  /CHAT_MESSAGE_TOO_LONG/
);

ChatQueueService.reset();
const queueItems = [];
for(let index = 0; index < CHAT_LIMITS.MAX_QUEUE_SIZE; index++){
  queueItems.push(ChatQueueService.enqueue({type:"test",data:index}));
}
assert.equal(queueItems.every(Boolean),true);
assert.equal(ChatQueueService.enqueue({type:"overflow"}),null);

ChatQueueService.reset();
const first = ChatQueueService.enqueue({type:"active"});
assert.ok(first?.id);
const active = ChatQueueService.dequeue();
assert.equal(active.id,first.id);
assert.equal(ChatQueueService.complete(first.id),true);
assert.equal(ChatQueueService.status().activeItemId,null);

ChatStreamService.reset();
ChatStreamService.initialize();
assert.ok(ChatStreamService.start("stream-message"));
assert.equal(ChatStreamService.pushChunk("a".repeat(CHAT_LIMITS.MAX_STREAM_BUFFER_SIZE)),true);
assert.equal(ChatStreamService.pushChunk("b"),false);
assert.equal(ChatStreamService.status().status,"failed");

ChatActions.clearChat();
assert.equal(ChatState.getConversations().length,0);
assert.equal(ChatMessageService.getAll().length,0);
assert.equal(ChatQueueService.getAll().length,0);

assert.equal(ChatRuntime.shutdown(),true);
assert.equal(ChatRuntime.status().initialized,false);

console.log("Chat runtime checks passed.");
