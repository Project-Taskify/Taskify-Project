import Button from './Button';
import * as S from './styled';

const ToDoModalOption = ({ onClickEdit }) => {
  return (
    <S.ModalOption>
      <div>
        <Button type="button" onClick={onClickEdit}>
          수정하기
        </Button>
        <Button>삭제하기</Button>
      </div>
    </S.ModalOption>
  );
};

export default ToDoModalOption;
