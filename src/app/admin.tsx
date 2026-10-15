import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase, type PaymentRequest, type Profile } from '../lib/supabase';

const colors = {
  background: '#081226',
  panel: '#10264A',
  raised: '#0A1A33',
  gold: '#C9A24B',
  light: '#E6C87E',
  white: '#F7F5F0',
  muted: '#9AA7BD',
  green: '#3FB27F',
  red: '#E25555',
  border: 'rgba(201,162,75,0.32)',
};

const planNames = { free: 'Free', regular: 'Regular', pro: 'Pro' };

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [approvingRequest, setApprovingRequest] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    const client = supabase;
    if (!client) {
      setErrorMessage('Configura Supabase antes de abrir el panel.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const [profileResult, requestResult] = await Promise.all([
        client.from('profiles').select('*').order('created_at', { ascending: false }).limit(200),
        client.from('payment_requests').select('*').order('created_at', { ascending: false }).limit(200),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (requestResult.error) throw requestResult.error;
      setProfiles(profileResult.data);
      setRequests(requestResult.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const client = supabase;
    if (!client) return;

    const restoreSession = async () => {
      const { data, error } = await client.auth.getSession();
      if (!mounted) return;
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      const currentSession = data.session;
      if (currentSession?.user.app_metadata.role === 'admin') {
        setSession(currentSession);
        await loadDashboard();
      } else if (currentSession) {
        await client.auth.signOut();
        setErrorMessage('Esta cuenta no tiene permisos de administrador.');
      }
    };
    void restoreSession();

    const { data: authListener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      if (nextSession?.user.app_metadata.role === 'admin') {
        setSession(nextSession);
        void loadDashboard();
      } else {
        setSession(null);
        setProfiles([]);
        setRequests([]);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadDashboard]);

  const signIn = async () => {
    const client = supabase;
    if (!client) {
      setErrorMessage('Configura Supabase antes de abrir el panel.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    if (data.user?.app_metadata.role !== 'admin') {
      await client.auth.signOut();
      setErrorMessage('Esta cuenta no tiene permisos de administrador.');
      return;
    }
    setSession(data.session);
    await loadDashboard();
  };

  const approvePayment = async (requestId: string) => {
    const client = supabase;
    if (!client) return;
    setApprovingRequest(requestId);
    setErrorMessage('');
    const { error } = await client.rpc('approve_payment_request', {
      p_request_id: requestId,
    });
    if (error) {
      setErrorMessage(error.message);
    } else {
      await loadDashboard();
    }
    setApprovingRequest(null);
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setErrorMessage(error.message);
    else setSession(null);
  };

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const pendingCount = requests.filter((request) => request.status === 'pending').length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>MedsafeLatam Academy</Text>
        <Text style={styles.title}>Panel de administración</Text>
        {!session ? (
          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>Acceso del equipo</Text>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="admin@ejemplo.com"
              placeholderTextColor={colors.muted}
            />
            <Text style={styles.label}>CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Contraseña"
              placeholderTextColor={colors.muted}
            />
            {errorMessage || !supabase ? <Text style={styles.error}>{errorMessage || 'Configura Supabase antes de abrir el panel.'}</Text> : null}
            <TouchableOpacity style={styles.primaryButton} onPress={() => void signIn()} disabled={loading}>
              <Text style={styles.primaryButtonText}>{loading ? 'Ingresando…' : 'Ingresar al panel'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.toolbar}>
              <Text style={styles.muted}>{session.user.email} · {pendingCount} pendiente(s)</Text>
              <View style={styles.toolbarActions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => void loadDashboard()}>
                  <Text style={styles.secondaryButtonText}>Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => void signOut()}>
                  <Text style={styles.secondaryButtonText}>Salir</Text>
                </TouchableOpacity>
              </View>
            </View>
            {errorMessage || !supabase ? <Text style={styles.error}>{errorMessage || 'Configura Supabase antes de abrir el panel.'}</Text> : null}
            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>Solicitudes de pago</Text>
              {loading ? <ActivityIndicator color={colors.gold} /> : null}
              {!loading && requests.length === 0 ? <Text style={styles.muted}>Todavía no hay solicitudes.</Text> : null}
              {requests.map((request) => {
                const profile = profileById.get(request.user_id);
                return (
                  <View key={request.id} style={styles.requestCard}>
                    <View style={styles.row}>
                      <Text style={styles.requestPlan}>{planNames[request.plan]}</Text>
                      <Text style={[styles.status, request.status === 'approved' ? styles.approved : request.status === 'rejected' ? styles.rejected : styles.pending]}>
                        {request.status === 'pending' ? 'Pendiente' : request.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                      </Text>
                    </View>
                    <Text style={styles.body}>{profile?.display_name ?? 'Usuario'} · {profile?.email ?? 'Correo no disponible'}</Text>
                    <Text style={styles.body}>{request.amount_bob} Bs · {new Date(request.created_at).toLocaleString()}</Text>
                    <Text style={styles.muted}>Solicitud {request.id}</Text>
                    {request.status === 'pending' ? (
                      <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => void approvePayment(request.id)}
                        disabled={approvingRequest !== null}
                      >
                        <Text style={styles.primaryButtonText}>
                          {approvingRequest === request.id ? 'Aprobando…' : 'Aprobar pago y activar plan'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              })}
            </View>
            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>Usuarios ({profiles.length})</Text>
              {profiles.map((profile) => (
                <View key={profile.id} style={styles.userRow}>
                  <View style={styles.userCopy}>
                    <Text style={styles.body}>{profile.display_name}</Text>
                    <Text style={styles.muted}>{profile.email}</Text>
                  </View>
                  <Text style={styles.userPlan}>{planNames[profile.plan]}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  page: { width: '100%', maxWidth: 820, alignSelf: 'center', padding: 18, paddingBottom: 40 },
  brand: { color: colors.light, fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 10 },
  title: { color: colors.white, fontSize: 23, fontWeight: '800', textAlign: 'center', marginVertical: 18 },
  panel: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 15, marginBottom: 14 },
  sectionTitle: { color: colors.light, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  label: { color: colors.muted, fontSize: 10, fontWeight: '700', marginTop: 12, marginBottom: 5 },
  input: { backgroundColor: colors.raised, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 11, color: colors.white, fontSize: 14 },
  primaryButton: { backgroundColor: colors.gold, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  primaryButtonText: { color: colors.background, fontSize: 12, fontWeight: '800' },
  secondaryButton: { borderColor: colors.gold, borderWidth: 1, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 8 },
  secondaryButtonText: { color: colors.light, fontSize: 11, fontWeight: '700' },
  error: { color: colors.red, fontSize: 12, lineHeight: 18, marginTop: 9 },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  body: { color: colors.white, fontSize: 12, lineHeight: 18, marginTop: 4 },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12 },
  toolbarActions: { flexDirection: 'row', gap: 8 },
  requestCard: { backgroundColor: colors.raised, borderColor: colors.border, borderWidth: 1, borderRadius: 9, padding: 11, marginBottom: 9 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  requestPlan: { color: colors.white, fontSize: 14, fontWeight: '700' },
  status: { fontSize: 10, fontWeight: '800' },
  pending: { color: colors.gold },
  approved: { color: colors.green },
  rejected: { color: colors.red },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderTopColor: colors.border, borderTopWidth: 1, paddingVertical: 9 },
  userCopy: { flex: 1 },
  userPlan: { color: colors.light, fontSize: 11, fontWeight: '700' },
});
