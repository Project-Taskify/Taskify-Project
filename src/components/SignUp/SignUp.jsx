import * as S from './styled';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import AuthInput from '../AuthInput/AuthInput';
import BaseModal from '../common/Modal';
import ModalCheckIt from '../Modal/ModalCheckIt/ModalCheckIt';
import useBooleanState from '../../hooks/useBooleanState';
import instance from '../../lib/axios';
import { Link, useNavigate } from 'react-router-dom';
import big_logo from '@images/largeLogo.svg';

const PASSWORD_MIN_LENGTH = 8;
const NICKNAME_MAX_LENGTH = 10;

function SignUp() {
  const [isOpenSignUpCheckModal, openSignUpCheckModal, closeSignUpCheckModal] = useBooleanState();

  const [isOpenEmailCheckErrorModal, openEmailCheckErrorModal, closeEmailCheckErrorModal] =
    useBooleanState();

  const {
    formState: { errors },
    register,
    getValues,
    handleSubmit,
  } = useForm({
    mode: 'all',
  });

  const { mutateAsync: signup } = useMutation({
    mutationFn: (userInfo) => {
      return instance.post('/users', userInfo);
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (fieldValues) => {
    const { email, nickname, password } = fieldValues;

    const userInfo = {
      email,
      nickname,
      password,
    };

    try {
      await signup(userInfo);

      openSignUpCheckModal();
    } catch (error) {
      if (error.response.status === 409) {
        openEmailCheckErrorModal();
        return;
      }

      alert('서버 에러가 발생했습니다.');
    }
  };

  const handleClickModalCheckItConfirmButton = () => {
    closeSignUpCheckModal();
    navigate('/login');
  };

  return (
    <>
      <BaseModal isOpen={isOpenSignUpCheckModal}>
        <ModalCheckIt
          text="가입이 완료되었습니다!"
          confirmButton="확인"
          onClickConfirm={handleClickModalCheckItConfirmButton}
        />
      </BaseModal>

      <BaseModal isOpen={isOpenEmailCheckErrorModal}>
        <ModalCheckIt
          text="이미 사용 중인 이메일입니다."
          confirmButton="확인"
          onClickConfirm={closeEmailCheckErrorModal}
        />
      </BaseModal>

      <S.Container>
        <S.Logo>
          <Link to="/">
            <img src={big_logo} />
            {/* <img src="src/assets/images/largeLogo.svg" alt="랜딩 페이지로 이동하려면 클릭" /> */}
          </Link>
        </S.Logo>
        <S.Text>첫 방문을 환영합니다!</S.Text>

        <S.Form onSubmit={handleSubmit(onSubmit)}>
          <AuthInput
            label="이메일"
            placeholder="이메일을 입력해 주세요"
            data="이메일"
            error={errors.email?.message}
            {...register('email', {
              required: '이메일을 입력해주세요.',
              pattern: {
                value: /^[a-zA-Z0-9.!#$%&â€™*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                message: '이메일 형식에 맞게 입력해주세요.',
              },
            })}
          />
          <AuthInput
            label="닉네임"
            placeholder="닉네임을 입력해 주세요"
            data="닉네임"
            error={errors.nickname?.message}
            {...register('nickname', {
              required: '닉네임을 입력해주세요.',
              pattern: {
                value: NICKNAME_MAX_LENGTH,
                message: '열 자 이하로 작성해주세요.',
              },
            })}
          />
          <AuthInput
            label="비밀번호"
            placeholder="비밀번호를 입력해 주세요"
            data="pwd"
            error={errors.password?.message}
            {...register('password', {
              required: '비밀번호를 입력해주세요.',
              minLength: {
                value: PASSWORD_MIN_LENGTH,
                message: '비밀번호는 8자 이상 입력해주세요.',
              },
            })}
          />
          <AuthInput
            label="비밀번호확인"
            placeholder="비밀번호 확인을 한번 더 입력해 주세요"
            data="pwd"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: '비밀번호 확인을 한번 더 입력해 주세요',
              minLength: {
                value: PASSWORD_MIN_LENGTH,
                message: '비밀번호 확인은 8자 이상 입력해주세요.',
              },
              validate: {
                passwordAndPasswordConfirmDifferent: (confirmPassword) => {
                  const { password } = getValues();

                  if (confirmPassword !== password) {
                    return '비밀번호가 일치하지 않습니다.';
                  }
                },
              },
            })}
          />
          <S.CheckBox>
            <S.CheckInput type="checkbox" id="agree" name="agree" {...register('agree')} />
            <S.Label htmlFor="agree">이용약관에 동의합니다</S.Label>
          </S.CheckBox>
          <S.Button type="submit">가입하기</S.Button>
          <S.Logintext>
            이미 가입하셨나요?
            <S.LinkLogin>
              <Link to="/login">로그인하기</Link>
            </S.LinkLogin>
          </S.Logintext>
        </S.Form>
      </S.Container>
    </>
  );
}

export default SignUp;
