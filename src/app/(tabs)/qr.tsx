import { selectQrCodeToken } from '@/src/features/auth/authSelectors';
import { colors } from '@/src/theme/colors';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSelector } from 'react-redux';
export default function QrRoute() {

const qrCodeToken = useSelector(selectQrCodeToken);

if(!qrCodeToken){
    return (
        <View style={styles.notFound}>
            <Text style={styles.text}>No QR Code available.</Text>
        </View>
    )
}
return (
    <View style = {styles.notFound}>
        <QRCode value={qrCodeToken} size = {220}  />
        <Text style={styles.text}>Show this QR Code to the waiter</Text>
    </View>
)
}

const styles = StyleSheet.create({
    notFound: {
        backgroundColor: '#fff',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    text: {
        marginTop: 20,
        fontSize: 16,
        color: colors.primary,
    }
})