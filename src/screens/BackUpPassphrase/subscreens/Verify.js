import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import _ from 'lodash';
import MainLayout from '@components/MainLayout/index';
import Button from '@screens/BackUpPassphrase/components/Button';
import { Text, Toast, TouchableOpacity, View } from '@components/core';
import { COLORS, FONT, THEME } from '@src/styles';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { CustomError, ErrorCode } from '@services/exception';
import { createMasterKey, initMasterKey } from '@src/redux/actions/masterKey';
import { useDispatch } from 'react-redux';
import routeNames from '@routers/routeNames';
import { makeFakeFullDisk } from '@screens/Setting/features/DevSection/DevSection.utils';
import RemoveStorage from '@screens/Setting/features/RemoveStorage/RemoveStorage';

const styles = StyleSheet.create({
  desc: {
    ...THEME.text.mediumText,
    lineHeight: 24,
  },
  words: {
    marginTop: 50,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  word: {
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGrey20,
    paddingHorizontal: 10,
    paddingVertical: 10,
    textAlign: 'center',
    marginBottom: 10,
    marginHorizontal: 5,
  },
  wordStyle: {
    fontFamily: FONT.NAME.medium,
  },
  selected: {
    backgroundColor: COLORS.black2,
  },
  selectedText: {
    color: COLORS.white,
  },
  userWords: {
    marginTop: 20,
  },
  error: {
    ...FONT.STYLE.medium,
    marginTop: 10,
    fontSize: 14,
    color: COLORS.orange,
  },
  fakeFullDisk: {
    width: 30,
    height: 20,
    position: 'absolute',
    right: 0,
    bottom: 0
  }
});

const VerifyPassphrase = () => {
  const navigation = useNavigation();
  const data = useNavigationParam('data');
  const [wordsIndex, setWordsIndex] = useState([]);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [countTapFullDisk, setCountTapFullDisk] = useState(0);
  const dispatch = useDispatch();

  const displayWords = useMemo(() => {
    const words = data.mnemonic.split(' ');
    return _.shuffle(words);
  }, [data]);

  const userWords = useMemo(() => wordsIndex.map(
    index => displayWords[index]).join(' '),
  [wordsIndex]
  );

  const validateWords = () => {
    if (userWords !== data.mnemonic) {
      throw new CustomError(ErrorCode.invalid_mnemonic);
    }
  };

  const handleNext = async () => {
    try {
      if (!__DEV__) {
        validateWords();
      }

      setCreating(true);
      handleCreate(data);
    } catch (e) {
      setError(e.message);
      setCreating(false);
    }
  };

  const handleCreate = useCallback(_.debounce(async (data) => {
    try {
      if (data.isInit) {
        await dispatch(initMasterKey(data.name, data.mnemonic));
        navigation.navigate(routeNames.GetStarted);
      } else {
        await dispatch(createMasterKey(data));
        navigation.navigate(routeNames.MasterKeys);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }, 1000), []);

  const handleToggleWord = (index) => {
    let newWordsIndex;
    if (wordsIndex.includes(index)) {
      newWordsIndex = _.remove(wordsIndex, item => item !== index);
    } else {
      newWordsIndex = [...wordsIndex, index];
    }
    setWordsIndex(newWordsIndex);
  };

  const handlePressMakeFullDisk = async () => {
    if (countTapFullDisk === 7) {
      Toast.showInfo('active make full disk');
    } else if (countTapFullDisk >= 7) {
      await makeFakeFullDisk();
    }
    setCountTapFullDisk(countTapFullDisk + 1);
  };

  const renderButtonRemoveStorage = () => {
    if (error && error.includes('disk')) {
      return <RemoveStorage/>;
    }
    return null;
  };

  useEffect(() => {
    setError('');
  }, [userWords]);

  return (
    <>
      <MainLayout header="Verify phrase" scrollable>
        <Text style={styles.desc}>
          Tap on these words in the correct order.
        </Text>
        <View style={styles.words}>
          {displayWords.map((word, index) => (
            <TouchableOpacity
              key={`${word}-${index}`}
              style={[
                styles.word,
                wordsIndex.includes(index) && styles.selected
              ]}
              onPress={() => handleToggleWord(index)}
            >
              <Text
                key={word}
                style={[
                  wordsIndex.includes(index) && styles.selectedText,
                  styles.wordStyle,
                ]}
              >
                {word}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.desc, styles.userWords]}>
          {userWords}
        </Text>
        {!!error && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}
        <Button
          label={creating ? 'Creating...' : 'Create master key'}
          onPress={handleNext}
          disabled={creating || wordsIndex.length !== displayWords.length}
        />
        {renderButtonRemoveStorage()}
      </MainLayout>
      <TouchableOpacity
        onPress={handlePressMakeFullDisk}
        style={styles.fakeFullDisk}
      />
    </>
  );
};

export default VerifyPassphrase;
