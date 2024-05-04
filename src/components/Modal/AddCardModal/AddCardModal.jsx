import styled from 'styled-components';
import BaseModal from '../../common/Modal';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import instance from '../../../lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

const AddCardModal = ({ isOpen, columnId, dashboardId, onClose }) => {
  const { reset, register, handleSubmit } = useForm();

  const queryClient = useQueryClient();

  const { mutateAsync: createCard } = useMutation({
    mutationFn: async (cardInfo) => {
      const { data } = await instance.post('/cards', cardInfo);
      return data;
    },
  });

  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef(null);

  const [tag, setTag] = useState('');
  const [tags, setTags] = useState([]);

  const handleChangeTag = (e) => {
    setTag(e.target.value);
  };

  const handleChangeKeydown = (e) => {
    if (e.key === 'Enter') {
      setTags((prev) => [...prev, e.target.value]);
      setTag('');
    }
  };

  const handleClickFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleChangeFile = async (e) => {
    if (!e.target.files) {
      return;
    }

    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    const { data } = await instance.post(`/columns/${columnId}/card-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setImageUrl(data.imageUrl);
  };

  const onSubmit = async (fieldValues) => {
    const { assignee, title, description, dueDate } = fieldValues;

    try {
      await createCard({
        assigneeUserId: Number(assignee),
        dashboardId: Number(dashboardId),
        columnId,
        title,
        description,
        dueDate: format(dueDate, 'yyyy-MM-dd hh:mm'),
        tags,
        imageUrl,
      });

      queryClient.invalidateQueries({
        queryKey: ['cards', dashboardId],
      });

      onClose();
    } catch (error) {
      alert(error);
    }
  };

  useEffect(
    function resetFormFieldWhenUnmount() {
      return () => {
        reset();
        setImageUrl('');
      };
    },
    [reset],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <BaseModal isOpen={isOpen}>
      <S.Container>
        <S.Title>할 일 생성</S.Title>
        <S.FieldWrapper>
          <label>담당자</label>
          <select {...register('assignee')}>
            <option value="3222">유승완</option>
            <option value="3222">홀길동</option>
            <option value="3222">아무개</option>
          </select>
        </S.FieldWrapper>
        <S.FieldWrapper>
          <label htmlFor="title">제목 *</label>
          <input type="text" id="title" {...register('title', { required: true })} />
        </S.FieldWrapper>
        <S.FieldWrapper>
          <label htmlFor="description">설명 *</label>
          <textarea type="text" id="description" {...register('description', { required: true })} />
        </S.FieldWrapper>
        <S.FieldWrapper>
          <label htmlFor="endDate">마감일</label>
          <input type="date" id="endDate" {...register('dueDate')} />
        </S.FieldWrapper>
        <S.FieldWrapper>
          <label htmlFor="tag">태그</label>
          <input
            type="text"
            id="tag"
            value={tag}
            onChange={handleChangeTag}
            onKeyDown={handleChangeKeydown}
          />
          <S.TagList>
            {tags.map((tag) => (
              <div key={tag}>{tag}</div>
            ))}
          </S.TagList>
        </S.FieldWrapper>
        <S.FieldWrapper>
          <label htmlFor="image">이미지</label>
          {imageUrl ? (
            <Image src={imageUrl} alt="" />
          ) : (
            <S.ImageButton type="button" onClick={handleClickFileInput}>
              +
            </S.ImageButton>
          )}

          <S.ImageInput type="file" id="image" ref={fileInputRef} onChange={handleChangeFile} />
        </S.FieldWrapper>
        <S.ButtonWrapper>
          <S.CancelButton type="button" onClick={onClose}>
            취소
          </S.CancelButton>
          <S.CreateButton type="button" onClick={handleSubmit(onSubmit)}>
            생성
          </S.CreateButton>
        </S.ButtonWrapper>
      </S.Container>
    </BaseModal>
  );
};

export default AddCardModal;

const Container = styled.div`
  width: 506px;
  padding: 32px 28px 28px;
  background-color: #fff;

  input,
  select {
    border: 1px solid black;
    padding: 4px;
  }

  textarea {
    border: 1px solid black;
    padding: 4px;
    resize: none;
  }

  * + div {
    margin-top: 24px;
  }
`;

const Title = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333236;
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const TagList = styled.div`
  display: flex;
  gap: 4px;

  * + div {
    margin-top: 0px;
  }
`;

const ImageButton = styled.button`
  width: 76px;
  padding: 32px;
  background-color: #f5f5f5;
`;

const Image = styled.img``;

const ImageInput = styled.input`
  display: none;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
  gap: 12px;
`;

const CancelButton = styled.button`
  padding: 14px 46px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background-color: #fff;
  color: #787486;
`;

const CreateButton = styled.button`
  padding: 14px 46px;
  border: 1px solid #5534da;
  border-radius: 8px;
  background-color: #5534da;
  color: #fff;
`;

const S = {
  Container,
  Title,
  FieldWrapper,
  TagList,
  Image,
  ImageInput,
  ImageButton,
  ButtonWrapper,
  CancelButton,
  CreateButton,
};
