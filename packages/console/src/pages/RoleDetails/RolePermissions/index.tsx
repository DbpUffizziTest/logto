import type { Scope, ScopeResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import ConfirmModal from '@/components/ConfirmModal';
import PermissionsTable from '@/components/PermissionsTable';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useTableSearchParams, { formatKeyword } from '@/hooks/use-table-search-params';
import { buildUrl } from '@/utilities/url';

import type { RoleDetailsOutletContext } from '../types';
import AssignPermissionsModal from './components/AssignPermissionsModal';

const RolePermissions = () => {
  const {
    role: { id: roleId },
  } = useOutletContext<RoleDetailsOutletContext>();

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    pagination: { pageIndex, pageSize, setPageIndex },
    search: { keyword, setKeyword },
  } = useTableSearchParams();

  const { data, error, mutate } = useSWR<[ScopeResponse[], number], RequestError>(
    roleId &&
      buildUrl(`/api/roles/${roleId}/scopes`, {
        page: String(pageIndex),
        page_size: String(pageSize),
        ...conditional(keyword && { search: formatKeyword(keyword) }),
      })
  );

  const isLoading = !data && !error;

  const [scopes, totalCount] = data ?? [];

  const [isAssignPermissionsModalOpen, setIsAssignPermissionsModalOpen] = useState(false);
  const [scopeToBeDeleted, setScopeToBeDeleted] = useState<Scope>();
  const [isDeleting, setIsDeleting] = useState(false);

  const api = useApi();

  const handleDelete = async () => {
    if (!scopeToBeDeleted || isDeleting) {
      return;
    }
    setIsDeleting(true);

    try {
      await api.delete(`/api/roles/${roleId}/scopes/${scopeToBeDeleted.id}`);
      toast.success(
        t('role_details.permission.permission_deleted', { name: scopeToBeDeleted.name })
      );
      await mutate();
      setScopeToBeDeleted(undefined);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PermissionsTable
        isApiColumnVisible
        scopes={scopes}
        isLoading={isLoading}
        createButtonTitle="role_details.permission.assign_button"
        deleteButtonTitle="general.remove"
        createHandler={() => {
          setIsAssignPermissionsModalOpen(true);
        }}
        deleteHandler={setScopeToBeDeleted}
        errorMessage={error?.body?.message ?? error?.message}
        retryHandler={async () => mutate(undefined, true)}
        pagination={{
          pageIndex,
          pageSize,
          totalCount,
          onChange: setPageIndex,
        }}
        search={{
          keyword,
          searchHandler: (value) => {
            setKeyword(value);
            setPageIndex(1);
          },
          clearSearchHandler: () => {
            setKeyword('');
            setPageIndex(1);
          },
        }}
      />
      {scopeToBeDeleted && (
        <ConfirmModal
          isOpen
          isLoading={isDeleting}
          confirmButtonText="general.remove"
          onCancel={() => {
            setScopeToBeDeleted(undefined);
          }}
          onConfirm={handleDelete}
        >
          {t('role_details.permission.deletion_description')}
        </ConfirmModal>
      )}
      {isAssignPermissionsModalOpen && (
        <AssignPermissionsModal
          roleId={roleId}
          onClose={(success) => {
            if (success) {
              void mutate();
            }
            setIsAssignPermissionsModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default RolePermissions;
