import { PrimaryButtonDetails } from '@/components/buttons/PrimaryButtonDetails';
import { DetailsGudes } from '@/components/generals/DetailsGudes';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { GuideCard } from '@/components/generals/GuideCard';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { NetworkStatus } from '@/components/generals/NetworkStatus';
import { TodayDeliveries } from '@/components/generals/TodayDeliveries';
import { SearchInput } from '@/components/inputs/SearchInput';
import { GuideCardSkeleton } from '@/components/skeleton/GuideCardSkeleton';
import { ThemedView } from '@/components/themed-view';
import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { decodeJWT } from '@/src/utils/jwt';
import { getDeviceDateTime } from '@/src/utils/uitls';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";
import {
    Dimensions,
    Image, ScrollView, StyleSheet,
    Text,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface DetailsFormProps {
    initialGuide?: string;
    token?: string;
    onSubmit: (params: { guide: string; token: string }) => void | Promise<void>;
}

export function DetailsForm({ initialGuide = "", token = "", onSubmit }: DetailsFormProps) {
    const [guide, setGuide] = useState(initialGuide);
    const [tokenUser, setToken] = useState<string | null>(null);
    const [data, setData] = useState<GuideDetails[]>([]);
    const [filteredGuides, setFilteredGuides] = useState(data);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [date, setDate] = useState<string | null>(null);
    const router = useRouter();

    const isValid = guide.length >= 5;

    useEffect(() => {
        const fetchToken = async () => {
            const savedToken = await SecureStore.getItemAsync('AUTH_TOKEN');
            setToken(savedToken);
            await SecureStore.setItemAsync('LAST_ACTIVITY_AT', String(Date.now()));

            if (!savedToken) {
                router.replace('/auth/login');
                return;
            }
            const payload = decodeJWT(savedToken);
            const nowSec = Math.floor(Date.now() / 1000);
            const lastActivityStr = await SecureStore.getItemAsync('LAST_ACTIVITY_AT');
            const lastActivityMs = lastActivityStr ? Number(lastActivityStr) : Date.now();
            const threeHoursMs = 3 * 60 * 60 * 1000;
            if (!payload || (payload.exp && nowSec >= payload.exp) || Date.now() - lastActivityMs > threeHoursMs) {
                await SecureStore.deleteItemAsync('AUTH_TOKEN');
                await SecureStore.setItemAsync('LAST_LOGOUT_AT', getDeviceDateTime());
                router.replace('/auth/login');
            }
        };
        fetchToken();
    }, [router]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await detailsRepositoryImpl.listGuide(Number(guide), tokenUser || token);
            if (response?.statusCode == 200) {
                if (response?.data) {
                    const arrayData = Array.isArray(response.data) ? response.data : [response.data];
                    setData(arrayData as GuideDetails[]);
                    setFilteredGuides(arrayData as GuideDetails[]);
                }
            } else {
                setData([]);
                setFilteredGuides([]);
            }
        };
        fetchData();
    }, [guide, tokenUser || token]);

    const handleExit = async () => {
        setLoading(true);
        await SecureStore.deleteItemAsync('user_token');
        setDate(null);
        setTimeout(() => {
            setLoading(false);
            router.replace('/auth/login');
        }, 1200);
    };

    const handleSubmit = async () => {

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setModalTitle("Permiso denegado !!");
                setModalMessage("Se requiere acceso a la ubicación.");
                setLoading(false);
                setModalVisible(true);
                return;
            }
            setLoading(true);
            const initDate = getDeviceDateTime()
            setDate(initDate)
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });
            const response = await detailsRepositoryImpl.sendRouteInit(
                {
                    codigoGuia: String(guide),
                    latitud: String(location.coords.latitude),
                    longitud: String(location.coords.longitude),
                    fechaHoraDispositivo: initDate
                },
                token
            );
            if (response?.data?.statusCode == 200) {
                setRouteStarted(true);
                setLoading(false);

            } else {
                setModalTitle("Error !!");
                setModalMessage(response?.data?.message ?? "Ocurrio un error inesperado.");
                setModalVisible(true);
            }

        } catch (error: any) {
            setModalTitle("Error !!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <NetworkStatus />

            <View style={[styles.backgroundFill, { width, height }]} pointerEvents="none">
                <Image
                    source={require('@/assets/icons/Welcome.png')}
                    style={[styles.backgroundImage, { width, height }]}
                    resizeMode="cover"
                />
            </View>

            <DetailsGudes
                style={styles.logo}
                guide={Number(guide)}
                onExit={handleExit}
                date={date ? date : undefined}
                routeStarted={routeStarted}
            />

            {/* Panel blanco con altura fija */}
            <View style={[
                styles.whitePanel,
                { height: height - 200 }
            ]}>
                <View style={styles.content}>

                    <View style={styles.topContent}>

                        <TodayDeliveries
                            style={{ marginTop: -40 }}
                            data={data}
                            routeStarted={routeStarted}

                        />
                        <Text style={styles.title}>Tu ruta</Text>
                        <SearchInput
                            data={data}
                            keyExtractor={(item) => `${item.nombreCliente} ${item.codigoCliente}`}
                            onSearch={setFilteredGuides}
                            placeholder="Buscar por cliente o código"
                        />
                        <ScrollView
                            style={styles.guidesScroll}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        >
                            {data.length === 0 ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <GuideCardSkeleton key={i} />
                                ))
                            ) :
                                // Si ya se cargó data pero la búsqueda no encontró nada
                                filteredGuides.length === 0 ? (
                                    <View style={styles.noResultsContainer}>
                                        <Text style={styles.noResultsTitle}>No encontramos resultados</Text>
                                        <Text style={styles.noResultsSubtitle}>Ningún registro coincide con la búsqueda</Text>
                                    </View>
                                ) : (
                                    filteredGuides.map((item) => (
                                        <GuideCard
                                            key={item.codigoCliente}
                                            guide={item}
                                            onPress={() => console.log('Ir a dirección')}
                                            routeStarted={routeStarted}
                                        />
                                    ))
                                )
                            }
                        </ScrollView>
                    </View>

                    {!routeStarted && (
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <PrimaryButtonDetails
                                title="Comenzar ruta"
                                onPress={handleSubmit}
                                disabled={!isValid}
                                width={328}
                                height={44}
                            />
                        </View>
                    )}
                    <ExceptionModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        title={modalTitle}
                        message={modalMessage}
                        buttonLabel={modalButtonLabel}
                    />
                </View>
            </View>
            {loading && <LoadingBlue />}

        </ThemedView>
    );
}
const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignItems: 'center',
    },
    backgroundFill: {
        backgroundColor: '#164194',
    },
    backgroundImage: {
        zIndex: 1,
    },
    separator: {
        position: 'absolute',
        height: 5,
        transform: [{ rotate: '-15deg' }],
        zIndex: 2,
    },
    logo: {
        zIndex: 10,
        position: 'absolute',
        top: 100,
    },
    whitePanel: {
        position: 'absolute',
        top: 200,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        padding: 27,
        zIndex: 3,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topContent: {
        flex: 1,
    },
    title: {
        fontFamily: "Rubik",
        fontWeight: "700",
        fontSize: 24,
        textAlign: "left",
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 24,
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 4,
        textAlign: "center",
    },
    buttonContainer: {
        width: "100%",
        alignItems: 'center',
    },
    guidesScroll: {
        maxHeight: 400,
        marginTop: 12,
    },
    noResultsContainer: {
        width: 328,
        alignItems: 'center',
        marginTop: 40,
    },
    noResultsTitle: {
        width: 328,
        height: 19,
        fontFamily: "Rubik",
        fontWeight: "700",
        fontSize: 16,
        lineHeight: 19,
        textAlign: "center",
        color: "#788095",
        marginBottom: 8,
    },
    noResultsSubtitle: {
        width: 328,
        height: 14,
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 12,
        lineHeight: 14,
        textAlign: "center",
        color: "#788095",
    },
});
