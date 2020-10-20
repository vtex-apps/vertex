/* eslint-disable no-console */
import React, { FC, useState } from 'react'
import {
  FormattedMessage,
  defineMessages,
  injectIntl,
  InjectedIntlProps,
} from 'react-intl'
import { useMutation, useQuery } from 'react-apollo'
import {
  Layout,
  PageBlock,
  PageHeader,
  ModalDialog,
  Input,
  Button,
  Alert,
} from 'vtex.styleguide'

import saveMutation from './mutations/saveConfiguration.gql'
import deactivateMutation from './mutations/deactivate.gql'
import GET_CONFIG from './queries/getAppSettings.gql'
import CHECK from './queries/checkConfiguration.gql'

import './styles.global.css'

const messages: any = defineMessages({
  success: {
    id: 'admin/vextex.alert.success',
    defaultMessage: 'Saved successfully',
  },
  error: {
    id: 'admin/vextex.alert.error',
    defaultMessage: "Couldn't save",
  },
})

const AdminExample: FC<InjectedIntlProps> = ({ intl }) => {
  const [state, setState] = useState<any>({
    isDialogOpen: false,
    clientId: null,
    clientToken: null,
    apiKey: null,
    apiPassword: null,
  })

  const [
    deactivate,
    {
      loading: loadingDeactivate,
      called: calledDeactivate,
      error: errorDeactivate,
    },
  ] = useMutation(deactivateMutation)

  const [
    saveConfig,
    {
      loading: loadingSave,
      called: calledSave,
      error: errorSave,
      data: saveData,
    },
  ] = useMutation(saveMutation, {
    onCompleted: (res: any) => {
      if (res.saveAppSettings.status === 'conflict') {
        setState({
          ...state,
          isDialogOpen: true,
        })
      }
    },
  })

  const { loading } = useQuery(GET_CONFIG, {
    skip: loadingSave || !!state.clientId,
    onCompleted: (res: any) => {
      console.log('COMPLETED', res)
      setState({
        ...state,
        ...res.getAppSettings,
      })
    },
  })

  const { data: dataCheck } = useQuery(CHECK)

  const handleChange = (value: string, key: string) => {
    setState({
      ...state,
      [key]: value,
    })
  }

  const handleSave = () => {
    const { clientId, clientToken, apiKey, apiPassword } = state
    saveConfig({
      variables: {
        force: false,
        clientId,
        clientToken,
        apiKey,
        apiPassword,
      },
    })
  }

  const handleDialogClose = () => {
    setState({
      ...state,
      isDialogOpen: false,
    })
  }
  const handleCancelDialog = () => {
    handleDialogClose()
  }
  const handleForceDialog = () => {
    handleDialogClose()
    const { clientId, clientToken, apiKey, apiPassword } = state
    saveConfig({
      variables: {
        force: true,
        clientId,
        clientToken,
        apiKey,
        apiPassword,
      },
    })
  }

  console.log('State =>', state)

  return (
    <Layout
      pageHeader={
        <PageHeader
          title={<FormattedMessage id="admin/vextex.title" />}
          subtitle={<FormattedMessage id="admin/vextex.description" />}
        >
          {dataCheck?.checkConfiguration &&
            (!calledDeactivate || (calledDeactivate && errorDeactivate)) && (
              <Button
                variation="danger-tertiary"
                size="small"
                isLoading={loadingDeactivate}
                onClick={() => {
                  deactivate()
                }}
              >
                <FormattedMessage id="admin/vextex.deactivate" />
              </Button>
            )}
        </PageHeader>
      }
    >
      <PageBlock
        title={<FormattedMessage id="admin/vertex.configuration.title" />}
        subtitle={
          <FormattedMessage id="admin/vertex.configuration.titleHelper" />
        }
        variation="annotated"
      >
        <div className="w-100">
          <div className="mb5">
            <Input
              type="text"
              value={state.clientId}
              required
              disabled={loadingSave || loading}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleChange(e.target.value, 'clientId')
              }}
              label={
                <FormattedMessage id="admin/vertex.configuration.clientId" />
              }
            />
          </div>
          <div className="mb5">
            <Input
              type="text"
              value={state.clientToken}
              required
              disabled={loadingSave || loading}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleChange(e.target.value, 'clientToken')
              }}
              label={
                <FormattedMessage id="admin/vertex.configuration.clientToken" />
              }
            />
          </div>
          <div className="mb5">
            <Input
              type="text"
              value={state.apiKey}
              required
              disabled={loadingSave || loading}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleChange(e.target.value, 'apiKey')
              }}
              label={
                <FormattedMessage id="admin/vertex.configuration.apiKey" />
              }
            />
          </div>
          <div className="mb5">
            <Input
              type="password"
              value={state.apiPassword}
              required
              disabled={loadingSave || loading}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleChange(e.target.value, 'apiPassword')
              }}
              label={
                <FormattedMessage id="admin/vertex.configuration.apiPassword" />
              }
            />
          </div>
          <div className="mb5">
            <Button
              size="small"
              disabled={
                !state.clientId ||
                !state.clientToken ||
                !state.apiKey ||
                !state.apiPassword
              }
              isLoading={loadingSave || loading}
              onClick={handleSave}
            >
              <FormattedMessage id="admin/vertex.configuration.save" />
            </Button>
          </div>
          {(errorSave ||
            (saveData?.saveAppSettings?.status !== 'conflict' &&
              !loadingSave &&
              calledSave &&
              !errorSave)) && (
            <Alert type={errorSave ? 'error' : 'success'}>
              {intl.formatMessage(messages[errorSave ? 'error' : 'success'])}
            </Alert>
          )}
        </div>
        <ModalDialog
          centered
          confirmation={{
            onClick: handleForceDialog,
            label: intl.formatMessage({
              id: 'admin/vextex.alert.yes',
            }),
          }}
          cancelation={{
            onClick: handleCancelDialog,
            label: intl.formatMessage({
              id: 'admin/vextex.alert.no',
            }),
          }}
          isOpen={state.isDialogOpen}
          onClose={handleDialogClose}
        >
          <p>
            <FormattedMessage id="admin/vextex.alert.conflict" />
          </p>
        </ModalDialog>
      </PageBlock>
    </Layout>
  )
}
export default injectIntl(AdminExample)
