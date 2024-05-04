import styled from 'styled-components';
import { useInfinityRequest, useMutationRequest } from '../../hooks/useRequest';
import { useCallback, useEffect, useState } from 'react';
import { hexColorEncode } from '../../common/util';
import { queryClient } from '../../App';
import ColumnModal from '../Modal/Dashboard/ColumnModal';
import useBooleanState from '../../hooks/useBooleanState';
import ToDoModal from '../Modal/ToDoModal/ShowToDo/ToDoModal';
import AddCardModal from '../Modal/AddCardModal/AddCardModal';
import { useParams } from 'react-router-dom';
import setting_icon from '@icon/setting_icon.svg';
import add_icon from '@icon/dashboard_add_icon.svg';
import calendar_icon from '@icon/calendar_icon.png';

const ColumnList = ({ id, title, columnRequest }) => {
  const [isModalOpen, openModal, closeModal] = useBooleanState();
  const [isCardModal, openCardModal, closeCardModal] = useBooleanState();
  const [isCardAddModal, openCardAddModal, closeCardAddModal] = useBooleanState();

  const [cardList, setCardList] = useState([]);
  const [modalInfo, setModalInfo] = useState({});
  const { dashboardid } = useParams();

  const { data, fetchNextPage, setTarget } = useInfinityRequest({
    queryKey: ['cards', id],
    requestParam: { columnId: id, size: 5 },
    requestPath: '/cards',
    method: 'GET',
  });

  const {
    request: updateRequest,
    isSuccess,
    isError,
    error,
  } = useMutationRequest({
    requestPath: `/columns/${id}`,
    queryKey: ['column', 'update', id],
    method: 'PUT',
  });

  const updateColumn = useCallback(
    (title) => {
      updateRequest({ title });
    },
    [id],
  );

  useEffect(() => {
    if (isSuccess) {
      window.location.reload();
      closeModal();
    }
    if (isError) {
      alert(error?.response?.data?.message ?? '오류가 발생했습니다.');
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    fetchNextPage();
    return () => {
      setCardList([]);
      queryClient.resetQueries({ queryKey: ['cards', id], exact: true });
    };
  }, [id]);

  useEffect(() => {
    if (data?.pages.length > 0) {
      setCardList([...cardList, ...data.pages[data.pages.length - 1].cards]);
    }
  }, [data]);

  useEffect(() => {
    columnRequest({ dashboardId: dashboardid });
  }, [isModalOpen]);

  return (
    <ColumnContainer>
      <ColumnModal
        modalInfo={{ id, title }}
        isModalOpen={isModalOpen}
        onSuccess={(title) => {
          updateColumn(title);
        }}
        closeModal={closeModal}
      />
      <ToDoModal isOpen={isCardModal} columnId={id} colseModal={closeCardModal} {...modalInfo} />
      <AddCardModal
        isOpen={isCardAddModal}
        columnId={id}
        dashboardId={dashboardid}
        onClose={closeCardAddModal}
      />

      <ColumnTitle color="#333333">
        <div className="title_area">
          <img className="dot" />
          <h1 className="title">{title}</h1>
          <p className="count">{cardList?.length ?? 0}</p>
        </div>
        <button className="setting_button" onClick={openModal}>
          <img src={setting_icon} />
        </button>
      </ColumnTitle>
      <CardList>
        <button className="card_default new_card" type="button" onClick={openCardAddModal}>
          <img src={add_icon} />
        </button>
        {cardList?.map((e) => {
          return (
            <button
              key={e.id}
              className={'card_default column_card' + (e?.imageUrl ? '' : ' no_image')}
              onClick={() => {
                setModalInfo({ ...e, columnName: title });
                openCardModal();
              }}
            >
              {e?.imageUrl && <img className="card_img" src={e?.imageUrl} />}
              <strong className="title">{e.title}</strong>
              <TagList>
                {e?.tags?.map((tag, i) => {
                  return (
                    <Tag key={tag + '' + i} color={hexColorEncode(tag)}>
                      {tag}
                    </Tag>
                  );
                })}
              </TagList>
              <div className="card_info">
                <p className="date">
                  <img src={calendar_icon} />
                  {e.dueDate}
                </p>
                <UserCircle color={hexColorEncode(e.assignee.nickname)}>
                  {e.assignee.nickname.slice(0, 1).toUpperCase()}
                </UserCircle>
              </div>
            </button>
          );
        })}
        <div className="target" ref={setTarget}></div>
      </CardList>
    </ColumnContainer>
  );
};

export default ColumnList;

const ColumnContainer = styled.article`
  width: 22.125rem;
  height: 100%;
  padding: 1.25rem;
  border: 1px solid var(--gray-gray_EEEEEE, #eee);
  overflow-y: auto;

  @media (max-width: 743px) {
    width: calc(100vw - 4.1875rem);
    max-height: 29.375rem;
    padding: 1 0.75rem;
  }

  @media (min-width: 744px) and (max-width: 1220px) {
    width: 36.5rem;
    max-height: 21.625rem;
  }

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.4);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
  }
`;

const ColumnTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  .title_area {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    .dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 100%;
      margin-right: 0.5rem;
      border: 0;
      background-color: ${(props) => props.color};
    }
    .title {
      color: var(--black-black_333236, #333236);
      font-size: 1.125rem;
      font-weight: 700;
      line-height: normal;
      margin: 0;
      @media (max-width: 743px) {
        font-size: 1rem;
      }
    }
    .count {
      display: flex;
      width: 1.25rem;
      height: 1.25rem;
      padding: 0.1875rem 0.375rem;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 0.25rem;
      background: var(--gray-gray_EEEEEE, #eee);
      color: var(--gray-gray_787486, #787486);
      font-size: 0.75rem;
      font-weight: 500;
      line-height: normal;
    }
  }
  .setting_button {
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    background: transparent;
    &:focus-visible,
    &:focus,
    &:hover {
      outline: none;
      border-color: transparent;
    }
  }
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  .card_default {
    width: 19.625rem;
    min-height: 2.5rem;
    border-radius: 0.375rem;
    border: 1px solid var(--gray-gray_D9D9D9, #d9d9d9);
    background: var(--white-white_FFFFFF, #fff);

    @media (max-width: 743px) {
      width: 100%;
      min-height: 2rem;
    }

    @media (min-width: 744px) and (max-width: 1220px) {
      width: 34rem;
    }
    &.new_card {
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        margin-left: 0.75rem;
        display: flex;
        width: 1.375rem;
        height: 1.375rem;
        padding: 0.1875rem;
        justify-content: center;
        align-items: center;
        border-radius: 0.25rem;
        background: ${({ theme }) => theme.color.violet_8p};
        @media (max-width: 743px) {
          width: 1.25rem;
          height: 1.25rem;
          padding: 0.17rem;
        }
      }
    }
    &.column_card {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.63rem;

      @media (max-width: 743px) {
        padding: 0.75rem;
        gap: 0.37rem;
      }

      @media (min-width: 744px) and (max-width: 1220px) {
        display: grid;
        grid-template-areas:
          'image text text'
          'image tag user';

        grid-template-columns: 1fr 2fr 2fr;
        &.no_image {
          grid-template-areas:
            'text text'
            'tag user';

          grid-template-columns: 1fr 1fr;
        }
      }
      .card_img {
        width: 100%;
        border-radius: 0.375rem;
        grid-area: image;

        @media (min-width: 744px) and (max-width: 1220px) {
          width: 5.6725rem;
        }
      }
      .title {
        grid-area: text;
        color: var(--black-black_333236, #333236);
        font-family: Pretendard;
        font-size: 1rem;
        font-style: normal;
        font-weight: 500;
        line-height: normal;

        @media (max-width: 743px) {
          font-size: 0.875rem;
        }

        @media (min-width: 744px) and (max-width: 1220px) {
          align-self: center;
          justify-self: start;
        }
      }
      .card_info {
        grid-area: user;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .date {
          display: flex;
          gap: 0.38rem;
          align-items: center;
          color: var(--gray-gray_787486, #787486);
          font-size: 0.75rem;
          font-weight: 500;
          line-height: normal;

          @media (max-width: 743px) {
            font-size: 0.625rem;
          }
        }
        .user {
          width: 1.5rem;
          height: 1.5rem;
          background: #a3c4a2;
          border-radius: 100%;
          @media (max-width: 743px) {
            width: 1.375rem;
            height: 1.375rem;
          }
        }
      }
    }
  }
  .target {
    height: 1px;
  }
`;
const TagList = styled.div`
  grid-area: tag;
  width: 100%;
  overflow-x: auto;
  display: flex;
  gap: 0.37rem;
`;
const Tag = styled.div`
  background-color: ${(props) => props.color};
  color: #fff;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: normal;
  padding: 0.25rem 0.375rem;
  border-radius: 0.25rem;

  @media (max-width: 743px) {
    font-size: 0.625rem;
  }
`;
const UserCircle = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 100%;
  background-color: ${(props) => props.color};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Montserrat;
  font-size: 0.75rem;
  font-weight: 600;
  @media (max-width: 743px) {
    width: 1.375rem;
    height: 1.375rem;
    font-size: 0.625rem;
  }
`;
