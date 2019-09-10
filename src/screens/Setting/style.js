import { COLORS, FONT, SPACING, DECOR } from '@src/styles';
import { StyleSheet } from 'react-native';

const HEADER_HEIGHT = 35;

export const settingStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGrey6
  }
});

export const sectionStyle = StyleSheet.create({
  container: {
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: HEADER_HEIGHT
  },
  iconContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  infoContainer: {
    marginHorizontal: 20,
    alignItems: 'flex-start',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  item: {
    flexDirection: 'row',
    borderTopWidth: DECOR.borderWidth,
    borderColor: COLORS.lightGrey5,
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  lastItem: {
    borderBottomWidth: DECOR.borderWidth,
  },
  items: {
    backgroundColor: COLORS.white,
  },
  label: {
    fontSize: 12,
    color: COLORS.lightGrey1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleItem: {
    fontSize: FONT.SIZE.medium
  },
  descItem: {
    color: COLORS.lightGrey1
  }
});

export const accountSection = StyleSheet.create({
  itemWrapper: {
    backgroundColor: COLORS.white,
    borderTopWidth: DECOR.borderWidth,
    borderColor: COLORS.lightGrey5
  },
  importButton: {
  },
  importButtonText: {
    color: COLORS.primary
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  name: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    marginHorizontal: 20,
    color: COLORS.lightGrey1
  },
  nameTextActive: {
    marginHorizontal: 20,
    color: COLORS.dark1
  },
  actionBtn: {
    flexBasis: 50,
    paddingVertical: 15,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  optionMenu: {
    height: HEADER_HEIGHT,
  },
  indicator: {
    position: 'absolute',
    left: -20,
    height: '100%',
    width: 6,
    backgroundColor: COLORS.transparent
  },
  indicatorActive: {
    backgroundColor: COLORS.primary
  },
  swipeoutButton: {
    backgroundColor: COLORS.transparent
  }
});