import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useSearchParams } from 'react-router-dom';

import Button from '@/components/Button';
import Card from '@/components/Card';
import Eye from '@/icons/Eye';
import * as modalStyles from '@/scss/modal.module.scss';

import * as styles from './CreateSuccess.module.scss';

type Props = {
  username: string;
};

const CreateSuccess = ({ username }: Props) => {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const passwordEncoded = searchParameters.get('password');
  const password = passwordEncoded && atob(passwordEncoded);

  const handleClose = () => {
    setSearchParameters({});
  };

  const handleCopy = async () => {
    if (!password) {
      return null;
    }
    await navigator.clipboard.writeText(
      `User username: ${username}\nInitial password: ${password}`
    );
    toast.success(t('copy.copied'));
  };

  if (!password) {
    return null;
  }

  return (
    <ReactModal isOpen className={modalStyles.content} overlayClassName={modalStyles.overlay}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <h1>{t('user_details.created_title')}</h1>
        </div>
        <div className={styles.body}>
          <div>{t('user_details.created_guide')}</div>
          <div className={styles.info}>
            <div className={styles.infoLine}>
              <div>{t('user_details.created_username')}</div>
              <div className={styles.infoContent}>{username}</div>
            </div>
            <div className={styles.infoLine}>
              <div>{t('user_details.created_password')}</div>
              <div className={styles.infoContent}>
                {passwordVisible ? password : password.replace(/./g, '*')}
              </div>
              <div className={styles.operation}>
                {/* TODO: Replaced into IconButton(LOG-1890) */}
                <Eye
                  onClick={() => {
                    setPasswordVisible((previous) => !previous);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <Button title="admin_console.user_details.created_button_close" onClick={handleClose} />
          <Button
            type="primary"
            title="admin_console.user_details.created_button_copy"
            onClick={handleCopy}
          />
        </div>
      </Card>
    </ReactModal>
  );
};

export default CreateSuccess;
