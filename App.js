// How to Upload any File or Image to AWS S3 Bucket from React Native App
// https://aboutreact.com/react-native-upload-file-to-aws-s3-bucket/

// Import React
import React, { useState } from 'react';
// Import required components
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { RNS3 } from 'react-native-aws3';
import { RNCamera } from 'react-native-camera';
import { useCamera } from 'react-native-camera-hooks';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import Pdf from 'react-native-pdf';

const App = () => {
  const [filePath, setFilePath] = useState({});
  const [singleFile, setSingleFile] = useState('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [{ cameraRef }, { takePicture }] = useCamera(null);
  const captureHandle = async () => {
    try {
      const data = await takePicture();
      console.log(data);
      setFilePath(data);


    }
    catch (error) {
      console.log(error);
    }


  }
  const selectOneFile = async () => {

    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],

      });
      console.log(res[0]);
      //Printing the log realted to the file

      //Setting the state to show single file attributes
      setFilePath(res[0]);
    } catch (err) {

      if (DocumentPicker.isCancel(err)) {

        alert('Canceled from single doc picker');
      } else {

        alert('Unknown Error: ' + JSON.stringify(err));
        throw err;
      }
    }
  };

  const chooseFile = () => {
    let options = {
      mediaType: 'photo',
    };
    launchImageLibrary(options, (response) => {
      console.log('Response = ', response);
      setFilePath(response.assets[0]);
      setUploadSuccessMessage('');
      if (response.didCancel) {
        alert('User cancelled camera picker');
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        alert(response.errorMessage);
        return;
      }

    });
  };

  const uploadFile = () => {
    if (Object.keys(filePath).length == 0) {
      alert('Please select image first');
      return;
    }

    RNS3.put(
      {

        // `uri` can also be a file system path (i.e. file://)
        uri: filePath.uri,
        name: filePath.fileName ? filePath.fileName : "capture.jpg",
        type: filePath.type ? filePath.type : "image/jpeg",

      },
      {
        keyPrefix: 'myuploads/', // Ex. myuploads/
        bucket: 'my-react-native-s3', // Ex. aboutreact
        region: 'ap-south-1', // Ex. ap-south-1
        accessKey: 'AKIAVFQWRSZB7IESWGJE',
        // Ex. AKIH73GS7S7C53M46OQ
        secretKey: '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',
        // Ex. Pt/2hdyro977ejd/h2u8n939nh89nfdnf8hd8f8fd
        successActionStatus: 201,
      },
    )
      .progress((progress) =>
        setUploadSuccessMessage(
          `Uploading: ${progress.loaded / progress.total} (${progress.percent
          }%)`,
        ),
      )
      .then((response) => {

        if (response.status !== 201)
          alert('Failed to upload image to S3');
        console.log(response.body);
        setFilePath('');
        let {
          bucket,
          etag,
          key,
          location
        } = response.body.postResponse;
        setUploadSuccessMessage(
          `Uploaded Successfully: 
          \n1. bucket => ${bucket}
          \n2. etag => ${etag}
          \n3. key => ${key}
          \n4. location => ${location}`,
        );
        /**
         * {
         *   postResponse: {
         *     bucket: "your-bucket",
         *     etag : "9f620878e06d28774406017480a59fd4",
         *     key: "uploads/image.png",
         *     location: "https://bucket.s3.amazonaws.com/**.png"
         *   }
         * }
         */
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleText}>
        How to Upload any File or Image to AWS S3 Bucket{'\n'}
        from React Native App
      </Text>
      <View style={styles.container}>
        {console.log(filePath)}
        {filePath.uri && filePath.type == "image/jpeg" || filePath.type == "image/png" ? (

          <>
            <Image
              source={{ uri: filePath.uri }}
              style={styles.imageStyle}
            />
            <Text style={styles.textStyle}>
              {filePath.uri}
            </Text>
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.buttonStyleGreen}
              onPress={uploadFile}>
              <Text style={styles.textStyleWhite}>
                Upload Image
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
        {filePath.uri && filePath.type == "application/pdf" ? (

          <>
            <Pdf
              source={{ uri: filePath.uri }}
              onLoadComplete={(numberOfPages, filePath) => {
                console.log(`Number of pages: ${numberOfPages}`);
              }}
              onPageChanged={(page, numberOfPages) => {
                console.log(`Current page: ${page}`);
              }}
              onError={(error) => {
                console.log(error);
              }}
              onPressLink={(uri) => {
                console.log(`Link pressed: ${uri}`);
              }}
              style={styles.pdf} />
            <Text style={styles.textStyle}>
              {filePath.uri}
            </Text>
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.buttonStyleGreen}
              onPress={uploadFile}>
              <Text style={styles.textStyleWhite}>
                Upload File
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
        {uploadSuccessMessage ? (
          <Text style={styles.textStyleGreen}>
            {uploadSuccessMessage}
          </Text>
        ) : null}
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={chooseFile}>
          <Text style={styles.textStyleWhite}>
            Choose Image
          </Text>
        </TouchableOpacity>
        {/* <RNCamera
          ref={cameraRef}

          type={RNCamera.Constants.Type.back}

          style={{ flex: 1, margin: '10%' }}
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}

        >



        </RNCamera>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={captureHandle}>
          <Text style={styles.textStyleWhite}>
            Use Camera
          </Text>

        </TouchableOpacity> */}
        <Text >
          File Name: {singleFile.name ? singleFile.name : ''}
          {'\n'}
          Type: {singleFile.type ? singleFile.type : ''}
          {'\n'}
          File Size: {singleFile.size ? singleFile.size : ''}
          {'\n'}
          URI: {singleFile.uri ? singleFile.uri : ''}
          {'\n'}
        </Text>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={selectOneFile}>

          <Text style={{ marginRight: 10, fontSize: 19 }}>
            Click here to pick one file
          </Text>
          <Image
            source={{
              uri: 'https://img.icons8.com/offices/40/000000/attach.png',
            }}
            style={styles.imageIconStyle}
          />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },

  pdf: {
    flex: 1,
    width: '50%',
    height: '50%',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
  },
  textStyle: {
    padding: 10,
    color: 'black',
    textAlign: 'center',
  },
  textStyleGreen: {
    padding: 10,
    color: 'green',
  },
  textStyleWhite: {
    padding: 10,
    color: 'white',
  },
  buttonStyle: {
    alignItems: 'center',
    backgroundColor: 'orange',
    marginVertical: 10,
    width: '100%',
  },
  buttonStyleGreen: {
    alignItems: 'center',
    backgroundColor: 'green',
    marginVertical: 10,
    width: '100%',
  },
  imageStyle: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    margin: 5,
  },
});