import { useState } from 'react';
import * as S from './styled';
import Button from './Button';

const ToDoModalComment = ({ id, user, comment, onEditComment, onDeleteComment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.text || '');

  const handleEditComment = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onEditComment(id, editedComment);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedComment(comment.text || '');
  };

  const handleDeleteComment = () => {
    onDeleteComment(id);
  };

  return (
    <S.ModalComment>
      <S.ModalCommentImg>
        <div>
          <img src={user?.image || ''} alt="img" />
        </div>
      </S.ModalCommentImg>
      <S.ModalCommentContainer>
        <div>
          <h1>{user.name}</h1>
          <p>{comment.time}</p>
        </div>
        {isEditing ? (
          <S.ModalEditComment>
            <textarea value={editedComment} onChange={(e) => setEditedComment(e.target.value)} />
            <div>
              <Button onClick={handleSaveEdit}>저장</Button>
              <Button onClick={handleCancelEdit}>취소</Button>
            </div>
          </S.ModalEditComment>
        ) : (
          <div>
            <span>{comment.text}</span>
            <ul>
              <li onClick={handleEditComment}>수정</li>
              <li onClick={handleDeleteComment}>삭제</li>
            </ul>
          </div>
        )}
      </S.ModalCommentContainer>
    </S.ModalComment>
  );
};

export default ToDoModalComment;
