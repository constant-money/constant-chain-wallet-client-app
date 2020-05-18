import { THEME, DECOR, COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  row: {
    // ...THEME.textInput,
    height: DECOR.inputHeight,
    alignItems: 'center',
    flexDirection: 'row',
  },
  label: {
    // ...THEME.text.defaultTextStyle,
    // fontSize: 14,
    marginBottom: 15,
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    color: COLORS.black,
  },
  labelFocus: {
    // color: COLORS.blue,
  },
  input: {
    flex: 1,
    height: DECOR.inputHeight,
    paddingVertical: 3,
    // fontSize: 16,
    // ...THEME.text.defaultTextStyle,
    fontSize: FONT.SIZE.superMedium,
    color: COLORS.colorGreyBold,
  },
  focus: {
    // borderColor: COLORS.blue,
    // borderBottomWidth: DECOR.borderWidth + 0.5,
  },
  maxLengthContainer: {
    alignSelf: 'flex-end',
  },
  maxLengthText: {
    fontSize: 10,
    color: COLORS.lightGrey8,
  },
});

export default style;
