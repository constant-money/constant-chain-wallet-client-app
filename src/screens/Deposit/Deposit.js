import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container, ScrollView, View, Toast, Text, Button } from '@src/components/core';
import { Field, formValueSelector, destroy } from 'redux-form';
import { createForm, InputField, validator } from '@src/components/core/reduxForm';
import { getErrorMessage } from '@src/services/errorHandler';
import { CONSTANT_COMMONS } from '@src/constants';
import WaitingDeposit from './WaitingDeposit';
import style from './style';

const formName = 'deposit';
const selector = formValueSelector(formName);
const Form = createForm(formName, { destroyOnUnmount: false });

class Deposit extends React.Component {
  constructor() {
    super();
  }

  componentWillUnmount() {
    const { destroy } = this.props;
    destroy(formName);
  }

  handleSubmit = () => {
    const { handleGenAddress, amount } = this.props;

    return handleGenAddress(amount)
      .catch(e => {
        Toast.showError(getErrorMessage(e));
      });
  }

  render() {
    const { depositAddress, selectedPrivacy, amount } = this.props;
    const isBTC = selectedPrivacy?.externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BTC;

    return (
      <ScrollView style={style.container}>
        <Container style={style.mainContainer}>
          {
            depositAddress
              ? <WaitingDeposit selectedPrivacy={selectedPrivacy} depositAddress={depositAddress} amount={amount} />
              : (
                <Form>
                  {({ handleSubmit, submitting }) => (
                    <View style={style.form}>
                      <Field
                        component={InputField}
                        name='amount'
                        placeholder='0.0'
                        label='Amount'
                        validate={[
                          ...isBTC ? [validator.bitcoinWithdrawMinAmount] : [],
                          validator.required,
                          ...validator.combinedAmount
                        ]}
                        componentProps={{
                          keyboardType: 'number-pad'
                        }}
                        prependView={
                          <Text>{selectedPrivacy?.symbol}</Text>
                        }
                      />
                      <Button
                        title='Continue'
                        style={style.submitBtn}
                        onPress={handleSubmit(this.handleSubmit)}
                        isAsync
                        isLoading={submitting}
                      />
                    </View>
                  )}
                </Form>
              )
          }
        </Container>
      </ScrollView>
    );
  }
}

Deposit.defaultProps = {
  depositAddress: null,
  selectedPrivacy: null,
  amount: null,
};

Deposit.propTypes = {
  depositAddress: PropTypes.string,
  selectedPrivacy: PropTypes.object,
  handleGenAddress: PropTypes.func.isRequired,
  destroy: PropTypes.func.isRequired,
  amount: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
};

const mapState = state => ({
  amount: selector(state, 'amount'),
});

const mapDispatch = { destroy };

export default connect(mapState, mapDispatch)(Deposit);
