import BaseScreen from '@screens/BaseScreen';
import _ from 'lodash';
import React from 'react';
import { View,ScrollView,Image,Text,TouchableOpacity } from 'react-native';
import { Button, Header } from 'react-native-elements';
import DialogLoader from '@src/components/DialogLoader';
import images, { imagesVector } from '@src/assets';
import Container from '@components/Container';
import HistoryMined from '@src/components/HistoryMined';
import routeNames from '@src/router/routeNames';
import DeviceService, { LIST_ACTION } from '@src/services/DeviceService';
import Device from '@src/models/device';
import { onClickView } from '@src/utils/ViewUtil';
import accountService from '@src/services/wallet/accountService';
import { connect } from 'react-redux';
import { accountSeleclor, tokenSeleclor } from '@src/redux/selectors';
import PropTypes from 'prop-types';
import CreateAccount from '@screens/CreateAccount';
import { DEVICES } from '@src/constants/miner';
import VirtualDeviceService from '@src/services/VirtualDeviceService';
import convert from '@src/utils/convert';
import common from '@src/constants/common';
import format from '@src/utils/format';
import HeaderBar from '@src/components/HeaderBar/HeaderBar';
import style from './style';

export const TAG = 'DetailDevice';

class DetailDevice extends BaseScreen {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;

    return {
      title: params && !_.isEmpty(params.title) ? params.title : 'Details'
    };
  };

  constructor(props) {
    super(props);
    const {navigation,wallet,token}= props;
    const { params } = navigation.state;
    const device = Device.getInstance(params?.device ||{});
    this.titleBar = device.Type == DEVICES.VIRTUAL_TYPE?'Virtual Node':'Node';
    this.productName = device.Name;
    // console.log(TAG,'constructor token',token);
    this.state = {
      loading: false,
      selectedIndex: 0,
      accountMiner:{},
      isStaked:undefined,
      wallet:wallet,
      balancePRV:0,
      listFollowingTokens:[],
      device: device
    };
    this.viewCreateAccount = React.createRef();
    navigation.setParams({ title: this.titleBar });
  }

  async componentDidMount() {
    await this.checkStatus('incognito');
    await this.checkAndUpdateInfoVirtualNode();
    this.fetchData();
  }

  set IsStaked (isStake:Boolean){
    this.setState({
      isStaked:isStake
    });
  }

  get IsStaked(){
    return this.state.isStaked;
  }

  checkAndUpdateInfoVirtualNode = async ()=>{
    const {device} = this.state;
    const {getAccountByPublicKey,getAccountByName,getAccountByBlsKey,listAccount} = this.props;
    let account = await getAccountByName(device.accountName());
    
    // with test-node publicKey
    let keyCompare = await VirtualDeviceService.getPublicKeyMining(device);

    // dev-test
    // const resultBLS = await VirtualDeviceService.getPublicKeyMining(device);
    // let keyCompare = resultBLS[0]??'';
  
    // const publicKey = '16yUvbgiXUZfwuWafBcXX4oiyYVui57e1oMtEyRCwkHemeqKvf9';
    // const isRegular = !_.includes(keyCompare,account?.BlockProducerKey);
    // console.log(TAG,'checkAndUpdateInfoVirtualNode listAccount ',listAccount);
    console.log(TAG,'checkAndUpdateInfoVirtualNode publicKey ',keyCompare);
    

    const isRegular = !_.isEqual(account?.PublicKeyCheckEncode,keyCompare);
    if(device.Type == DEVICES.VIRTUAL_TYPE && isRegular){
      keyCompare = _.split(keyCompare,':')[1]||keyCompare;
      console.log(TAG,'checkAndUpdateInfoVirtualNode1111111 publicKey ',keyCompare);
      account = getAccountByPublicKey(keyCompare);
      console.log(TAG,'checkAndUpdateInfoVirtualNode account ',account);
      !_.isEmpty(account) && await device.saveAccount({name:account.name});
    }
    this.setState({
      accountMiner:account
    });
  }

  createListFollowingToken=(result:{},listprivacyCustomToken:Array)=>{
    let amount = 0;
    console.log(TAG,'createListFollowingToken begin ',listprivacyCustomToken);
    return Object.keys(result).map((value,index)=>{
      let ObjFinded = _.find(listprivacyCustomToken,(item)=>_.isEqual(item.tokenId,value))||{
        symbol: value,
        name: 'Privacy',
        decimals: common.DECIMALS['PRV'],
        pDecimals: common.DECIMALS['PRV'],
        type: 0,
        amount:amount,
        pSymbol: 'pPRV',
        default: true,
        userId: 0,
        verified: true };
    
      console.log(TAG,'createListFollowingToken begin findd ---  ',ObjFinded);
      amount = format.amount(result[value],ObjFinded['pDecimals']??common.DECIMALS[value]);
      amount = _.isNaN(amount)?0:amount;
      return {
        ...ObjFinded,
        amount:amount,
      };
    });
  }

  fetchData = async ()=>{
    // get balance
    const {device,wallet,accountMiner} = this.state;
    const {listTokens} = this.props;
    let dataResult = {};
    let balancePRV = 0;
    let listFollowingTokens = [];
    const account = _.isEmpty(accountMiner)? await this.props.getAccountByName(device.accountName()):accountMiner;
    const stakerStatus =(!_.isEmpty(account)&& !_.isEmpty(wallet)? await accountService.stakerStatus(account,wallet).catch(console.log):-1)??-1;
    console.log(TAG,'fetchData stakerStatus ',stakerStatus);
    const isStaked = stakerStatus!=-1 ;
    switch(device.Type){
    case DEVICES.VIRTUAL_TYPE:{

      const listprivacyCustomToken:[] = listTokens;
      dataResult = await VirtualDeviceService.getRewardAmount(device) ?? {};
      // console.log(TAG,'fetchData VIRTUAL_TYPE ',dataResult);
      const {Result={}} = dataResult;
      balancePRV = convert.toHumanAmount(Result['PRV'],common.DECIMALS['PRV']);
      balancePRV = format.amount(Result['PRV'],common.DECIMALS['PRV']);
      balancePRV = _.isNaN(balancePRV)?0:balancePRV;
      listFollowingTokens = this.createListFollowingToken(Result,listprivacyCustomToken);
      break;
    }
    default:{
      
      listFollowingTokens = (!_.isEmpty(account) && await accountService.getFollowingTokens(account,wallet))||[];
      balancePRV = await device.balanceToken(account,wallet);        
    }
    }
    
    this.setState({
      accountMiner:account,
      listFollowingTokens,
      isStaked:isStaked,
      balancePRV:balancePRV
    });
    // console.log(TAG,'fetchData begin ',balance);
  }
  /**
   *
   * action : LIST_ACTION
   * @memberof DetailDevice
   */
  callAndUpdateAction = async (action:{},chain = 'incognito')=>{
    let {device} = this.state;
    try {
      if(!_.isEmpty(device)){
        this.setState({
          loading: true
        });
        const dataResult = await DeviceService.send(device.data,action,chain);
        console.log(TAG,'callAndUpdateAction send dataResult = ',dataResult);
        const { data={status:Device.offlineStatus()}, productId = -1 } = dataResult;
      
        if(device.data.product_id === productId ){
          device.Status = data.status;
        }else{
          device.Status = Device.offlineStatus();
        }
      }
    } catch (error) {
      device.Status = Device.offlineStatus();
      console.log(TAG,'callAction error = ',error);
    }finally{
      // console.log(TAG,'callAction finally = ',device.toJSON());
      this.setState({
        loading: false,
        device:device
      });
    }
  }

  checkStatus = async (chain='incognito')  => {
    let {device} = this.state;
    console.log(TAG,'checkStatus begin ',device.Type);
    switch(device.Type){
    case DEVICES.VIRTUAL_TYPE:{
      const dataResult = await VirtualDeviceService.getChainMiningStatus(device) ?? {};
      const { status = -1, data={status:Device.offlineStatus()},productId = -1 } = dataResult;
      console.log(TAG,'checkStatus begin VIRTUAL_TYPE',dataResult);
      if(_.isEqual(status,1)){
        
        device.Status = data.status;
        this.setState({
          device:device
        });
      }else{
        this.setDeviceOffline();
      }
      break;
    }
    default:{
      const action = LIST_ACTION.CHECK_STATUS;
      await this.callAndUpdateAction(action, chain);
    }
    }
  };
  setDeviceOffline =()=>{
    let {device} = this.state;
    device.Status = Device.offlineStatus();
    this.setState({
      device:device,
    });
  }

  handleSwitchIncognito = onClickView(async () => {
    let {
      device,
      loading,accountMiner
    } = this.state;
    if(!loading){
      //get ip to send private key
      const isStarted = device.isStartedChain();
      const isOffline = device.isOffline();
      const action = isStarted ? LIST_ACTION.STOP : LIST_ACTION.START;
      if(!isStarted && !isOffline){
        this.Loading = true;
        if(_.isEmpty(accountMiner)){
          accountMiner = await this.viewCreateAccount?.current?.createAccount(device.Name);
          this.setState({
            accountMiner
          });
        }
        const {PrivateKey = '',AccountName = '',PaymentAddress = ''} = accountMiner;
        const result = await DeviceService.sendPrivateKey(device,PrivateKey,'incognito');
        const { status= -1 } = result;
        await this.checkStatus();
        this.Loading = false;
      }
      
    }
    
  });
  // rightComponent={(
  //   <Button
  //     title="reset device"
  //     onPress={onClickView( async()=>{
  //       const {device} = this.state;
  //       this.Loading = true;
  //       const result = await DeviceService.reset(device);
  //       const {status = -1,message = 'fail'} = result||{};
  //       this.Loading = false;
  //       // await this.checkStatus('incognito');
  //       alert(status === 1 ? 'Success':message);

  //     })}
  //   />
  // )}
  // renderHeader = () => {
  //   const title = this.titleBar|| 'Details';
  //   return (
  //     <Header
  //       containerStyle={style.containerHeader}
  //       centerComponent={(
  //         <Text numberOfLines={1} style={style.titleHeader}>
  //           {title}
  //         </Text>
  //       )}
  //       leftComponent={imagesVector.ic_back({onPress:this.onPressBack},{paddingLeft:0,paddingRight:scaleInApp(30)})}
  //     />
  //   );
    
  // };
  renderHeader = () => {
    const {navigation} = this.props;
    const title = this.titleBar|| 'Details';
    const options= {
      title: title,
      headerBackground:'transparent',
      headerTitleStyle:style.titleHeader
    };
    return (
      <HeaderBar
        navigation={navigation}
        index={1}
        scene={{descriptor:{options}}} 
      />
    );
  };

  handlePressWithdraw = onClickView(async()=>{
    const {device,accountMiner,wallet} = this.state;
    this.Loading = true;
    const result = await device.requestWithdraw(accountMiner,wallet,'').catch(console.log);
    !_.isEmpty(result) && await this.fetchData();
    this.Loading = false;
  });

  handlePressStake = onClickView(async ()=>{
    
    const {device} = this.state;
    // hienton test
    // let listDeviceTest = await LocalDatabase.getListDevices();
    // const deviceJson = device.toJSON();
    // const time = Date.now().toString();
    // const deviceToClone = Device.getInstance({...deviceJson,product_name:`HIEN_TEST-${time}`,product_id:`${deviceJson.product_id}-${time}`});
    // listDeviceTest.push(deviceToClone);
    // await LocalDatabase.saveListDevices(listDeviceTest);
    // this.goToScreen(routeNames.HomeMine);
    
    this.goToScreen(routeNames.AddStake,{
      accountInfo:{
        minerAccountName:device.accountName(),
        funderAccountName:device.accountName()
      }
    });
  });

  renderGroupBalance = ()=>{
    const {device,balancePRV = 0,accountMiner} = this.state;
    // const isHaveWallet =  !_.isEmpty(accountMiner);
    const isHaveWallet =  !device.isOffline();
    
    return (
      <View style={style.group2_container}>
        <View style={style.group2_container_group1}>
          <View style={style.group2_container_container}>
            <Text style={style.group2_container_title}>TOTAL BALANCE</Text>
            <Text numberOfLines={1} style={style.group2_container_value}>{`${balancePRV} PRV`}</Text>
            {/* {isHaveWallet&&(
              <Button
                titleStyle={style.group2_container_button_text}
                buttonStyle={style.group2_container_button}
                onPress={this.handlePressStake}
                title='Stake'
              />
            )} */}
          </View>
          <View style={style.group2_container_container2}>
            {isHaveWallet&&(
              <Button
                titleStyle={style.group2_container_button_text}
                buttonStyle={style.group2_container_button2}
                onPress={this.handlePressWithdraw}
                title='Withdraw'
              />
            )}
            {!isHaveWallet && (
              <Text style={style.textWarning}>Your device is offline.</Text>
            )}
          </View>
        </View>
        
      </View>
    );
  }
  renderTop = ()=>{
    const {device,isStaked} = this.state;
    const stakeTitle = isStaked?'Stop':'Run';
    return (
      <TouchableOpacity
        style={style.top_container}
        onPress={()=>{
          if(__DEV__){
            const {device} = this.state;
            DeviceService.pingGetIP(device).then(data=>{
              this.showToastMessage('ping IP ' +JSON.stringify(data));
            });
          
          }
        }}
      >
        <View style={style.top_container_group}>
          <Text style={style.top_container_title} numberOfLines={1}>{this.productName}</Text>
          <Text style={[style.group2_container_value2,Device.getStyleStatus(device.Status.code)]}>{device.statusMessage()}</Text>
        </View>
        {device.Type === DEVICES.VIRTUAL_TYPE && !device.isOffline() && !device.isEarning()? (
          <Button
            titleStyle={style.group2_container_button_text}
            buttonStyle={style.group2_container_button}
            title={stakeTitle}
            onPress={onClickView( async()=>{
              const {accountMiner,isStaked} = this.state;
              if(!isStaked){
                if(!_.isEmpty(accountMiner)){
                  await this.handlePressStake();
                }else{
                  this.showToastMessage('None of your keys are linked to this node.Please import the node`s private key');
                }
              }else{
              // udpdate status at local
                this.IsStaked = false;
              }
            })}
          />
        ):null}
      </TouchableOpacity>
    );
  }

  render() {
    const {
      device,
      loading,
      listFollowingTokens
    } = this.state;
    const {navigation} = this.props;
    const isOffline = device?.isOffline()||false;
    const bgTop = device.Type === DEVICES.VIRTUAL_TYPE ?images.bg_top_virtual_device:images.bg_top_device;
    const bgRootTop = device.Type === DEVICES.VIRTUAL_TYPE ?0: images.bg_top_detail;
    return (
      <Container styleContainScreen={{paddingHorizontal:0}} styleRoot={style.container} backgroundTop={{source:bgRootTop,style:[style.imageTop,{backgroundColor:'#01828A'}]}}>
        {this.renderHeader()}
        <Image style={style.bg_top} source={bgTop} />
        <DialogLoader loading={loading} />
        <View style={{width: 0,height: 0,display:'none'}}>
          <CreateAccount navigation={navigation} ref={this.viewCreateAccount} />
        </View>
        <ScrollView>
          {this.renderTop()}
          {/* <ListItem
            containerStyle={style.top_container}
            hideChevron
            // rightElement={_.isEqual(device.Type,DEVICES.MINER_TYPE) && (
            //   <Button
            //     type="outline"
            //     buttonStyle={style.top_button_action}
            //     icon={{
            //       size: 15,name:device.isStartedChain()?'control-pause' :'control-play', type:'simple-line-icon', color:'black'
            //     }}
            //     disabled={isOffline}
            //     onPress={this.handleSwitchIncognito}
            //     title={null}
            //   />
            // )}
            leftElement={()=>{
              const {device} = this.state;
              return (
                <View style={style.group2_container_container}>
                  <Text style={style.top_container_title}>{this.productName}</Text>
                  <Text style={style.group2_container_title2}>STATUS <Text style={[style.group2_container_value2,Device.getStyleStatus(device.Status.code)]}>{device.statusMessage()}</Text></Text>
                </View>
              );
            }}
            rightElement={()=>{
              const {device,isStaked} = this.state;
              const stakeTitle = isStaked?'Pause':'Play';
              return (
                <Button
                  titleStyle={style.group2_container_button_text}
                  buttonStyle={style.group2_container_button}
                  title={stakeTitle}
                  onPress={onClickView( async()=>{
                    await this.handlePressStake();
                  })}
                />
              );
            }}
            onPress={()=>{
              if(__DEV__){
                const {device} = this.state;
                DeviceService.pingGetIP(device).then(data=>{
                  this.showToastMessage('ping IP ' +JSON.stringify(data));
                });
                
              }
            }}
          
          /> */}
          {this.renderGroupBalance()}
          {!_.isEmpty(listFollowingTokens) &&<HistoryMined containerStyle={style.group2_container} listItems={listFollowingTokens} />}
          
        </ScrollView>
        {this.renderToastMessage()}
        
      </Container>
    );
  }
}

DetailDevice.propTypes = {
  getAccountByName:PropTypes.func.isRequired,
  getAccountByPublicKey:PropTypes.func.isRequired,
  getAccountByBlsKey:PropTypes.func.isRequired,
  wallet:PropTypes.object.isRequired
};

DetailDevice.defaultProps = {};

const mapDispatch = { };

export default connect(
  state => ({
    wallet:state.wallet,
    getAccountByName: accountSeleclor.getAccountByName(state),
    listTokens:tokenSeleclor.pTokens(state),
    getAccountByPublicKey:accountSeleclor.getAccountByPublicKey(state),
    getAccountByBlsKey:accountSeleclor.getAccountByBlsKey(state),
    listAccount: accountSeleclor.listAccount(state)
  }),
  mapDispatch
)(DetailDevice);

