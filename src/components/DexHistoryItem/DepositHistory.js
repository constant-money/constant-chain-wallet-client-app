import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { generateTestId } from '@utils/misc';
import { TRADE } from '@src/constants/elements';
import { Icon } from 'react-native-elements';
import {View, Text, ActivityIndicator, TouchableOpacity} from '@components/core';
import { COLORS } from '@src/styles';
import stylesheet from './style';

const DepositHistory = ({ amount, tokenSymbol, status, account, onPress, isLastItem, style }) => (
  <TouchableOpacity accessible={false} style={[stylesheet.history, stylesheet.row, isLastItem && stylesheet.lastItem, style]} onPress={onPress}>
    <View style={[stylesheet.shortInfo]}>
      <Text {...generateTestId(TRADE.TITLE)} style={stylesheet.historyType}>Deposit</Text>
      <Text {...generateTestId(TRADE.CONTENT)} style={stylesheet.shortDesc} numberOfLines={2}>
        {`${amount} ${tokenSymbol} From ${account}`}
      </Text>
    </View>
    <View style={[stylesheet.textRight, stylesheet.row, stylesheet.historyStatus]}>
      {status === undefined ?
        <ActivityIndicator size="small" style={stylesheet.textRight} /> :
        <Text {...generateTestId(TRADE.STATUS)} style={[stylesheet.textRight, stylesheet[status]]}>{_.capitalize(status)}</Text>
      }
      <View style={stylesheet.icon}>
        <Icon name="chevron-right" color={COLORS.lightGrey1} />
      </View>
    </View>
  </TouchableOpacity>
);

DepositHistory.defaultProps = {
  status: undefined,
  isLastItem: false,
  style: {},
};

DepositHistory.propTypes = {
  tokenSymbol: PropTypes.string.isRequired,
  amount: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  account: PropTypes.string.isRequired,
  style: PropTypes.object,
  status: PropTypes.string,
  isLastItem: PropTypes.bool,
};

export default DepositHistory;
