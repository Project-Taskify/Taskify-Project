import { useState } from 'react';
import { debounce } from 'lodash';
import styled from 'styled-components';
import Button from '../common/Button';
import AvatarList from '../dashboard/AvatarList';
import { BUTTON_TYPE } from '../../constants/BUTTON_TYPE';
import MEDIA_QUERIES from '../../constants/MEDIA_QUERIES';
import setting_icon from '../../assets/icon/setting_icon.png';
import invite_icon from '../../assets/icon/invite_icon.png';
import crown_icon from '@icon/crown_icon.svg';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import UserName from './UserName';
import { useGetRequest } from '../../hooks/useRequest';
import { useEffect } from 'react';
import useBooleanState from '../../hooks/useBooleanState';
import InviteMemberModal from '../Modal/Dashboard/InviteMemberModal';

const Header = () => {
  const [isModalOpen, openModal, closeModal] = useBooleanState();
  const [userSize, setUserSize] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { dashboardid } = useParams();

  const handleResize = debounce(() => {
    if (window.innerWidth > 1199) {
      setUserSize(4);
    } else {
      setUserSize(2);
    }
  }, 200);

  const user = localStorage.getItem('user');

  const userInfo = useMemo(() => {
    return JSON.parse(user);
  }, [user]);

  const curPage = useMemo(() => {
    if (location.pathname.indexOf('mydashboard') > -1) {
      return 'mydashboard';
    } else if (location.pathname.indexOf('mypage') > -1) {
      return 'mypage';
    } else {
      return dashboardid;
    }
  }, [location]);

  const { data: dashboardInfo, request: dashboardRequest } = useGetRequest({
    requestPath: `/dashboards/${dashboardid}`,
    queryKey: ['dashboard', 'info', dashboardid],
  });

  const { data: memberData, request: memberRequest } = useGetRequest({
    requestPath: `/members`,
    queryKey: ['members', 'header', dashboardid],
  });

  const handleManageClick = () => {
    navigate(`/dashboard/${dashboardid}/edit`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!(curPage === 'mydashboard' || curPage === 'mypage')) {
      dashboardRequest();
      memberRequest({ dashboardId: dashboardid, page: 1, size: userSize + 1 });
    }
  }, [curPage, userSize]);

  return (
    <HeaderDiv>
      {curPage === 'mydashboard' || curPage === 'mypage' ? (
        <>
          <MenuDiv>{curPage === 'mydashboard' ? '나의 대시보드' : '계정관리'}</MenuDiv>
          <div
            style={{
              gap: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Link to={'/mypage'}>
              <UserName
                nickname={userInfo?.state?.user?.nickname}
                img={userInfo?.state?.user?.profileImageUrl}
                nameHidden={true}
              />
            </Link>
            <BtnStyle onClick={handleLogout} styleType={BUTTON_TYPE.SECONDARY} size="S">
              로그아웃
            </BtnStyle>
          </div>
        </>
      ) : (
        <>
          <InviteMemberModal
            isOpen={isModalOpen}
            closeModal={closeModal}
            id={dashboardid}
            onSuccess={() => {
              alert('대시보드에 초대헀습니다.');
            }}
          />
          <MenuDiv dashboard>
            <span>{dashboardInfo?.title}</span>
            {dashboardInfo?.createdByMe && (
              <img className="crown" src={crown_icon} alt="created by me" />
            )}
          </MenuDiv>
          <ProfileDiv>
            <BtnDiv>
              <BtnStyle onClick={handleManageClick} styleType={BUTTON_TYPE.SECONDARY} size="S">
                <img src={setting_icon} alt="Setting" />
                관리
              </BtnStyle>
              <BtnStyle onClick={openModal} styleType={BUTTON_TYPE.SECONDARY} size="S">
                <img src={invite_icon} alt="Invite" />
                초대하기
              </BtnStyle>
            </BtnDiv>
            <AvatarList max={memberData?.totalCount} users={memberData?.members} size={userSize} />
            <Link to="/mypage">
              <UserName
                nickname={userInfo?.state?.user?.nickname}
                img={userInfo?.state?.user?.profileImageUrl}
                nameHidden={true}
              />
            </Link>
          </ProfileDiv>
        </>
      )}
    </HeaderDiv>
  );
};

const HeaderDiv = styled.nav`
  position: fixed;
  width: calc(100vw - 18.75rem);
  height: 4.38rem;
  top: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  border-top: none;
  border-bottom: 0.1rem solid ${({ theme }) => theme.color.gray_D9};

  padding: 1rem 5rem 1rem 2.5rem;

  background-color: ${({ theme }) => theme.color.white};
  color: ${({ theme }) => theme.color.black_33};

  ${MEDIA_QUERIES.onTablet} {
    width: calc(100vw - 10rem);
    padding: 1rem 2.5rem;
  }
  ${MEDIA_QUERIES.onMobile} {
    width: calc(100vw - 4.1875rem);
    height: 3.75rem;
    padding: 0.81rem 0.75rem 0.88rem 1.5rem;
  }
`;

const MenuDiv = styled.div`
  align-items: center;
  font-weight: 700;
  font-size: 1.25rem;
  gap: 0.5rem;
  ${MEDIA_QUERIES.onTablet} {
    display: ${(props) => (props.dashboard ? 'none' : 'flex')};
  }
  ${MEDIA_QUERIES.onMobile} {
    display: ${(props) => (props.dashboard ? 'none' : 'flex')};
    font-size: 1.125rem;
  }
`;

const ProfileDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  ${MEDIA_QUERIES.onTablet} {
    width: 100%;
    justify-content: flex-end;
  }
  ${MEDIA_QUERIES.onMobile} {
    width: 100%;
    justify-content: flex-end;
  }
`;

const BtnDiv = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-right: 2rem;

  ${MEDIA_QUERIES.onMobile} {
    gap: 0.38rem;
    margin-right: 1rem;
  }
`;

const BtnStyle = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  gap: 0.5rem;

  color: ${({ theme }) => theme.color.gray_78};
  font-size: 0.875rem;
  border: 1px solid ${({ theme }) => theme.color.gray_D9};

  img {
    width: 1.25rem;
    height: 1.25rem;
  }

  ${MEDIA_QUERIES.onMobile} {
    img {
      display: none;
    }
    padding: 0.4rem 0.75rem;
    font-size: 0.875rem;
  }
`;

export default Header;
