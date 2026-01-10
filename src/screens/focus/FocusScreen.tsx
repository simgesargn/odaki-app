import React from "react";
import { View } from "react-native";
import SegmentedControl from "../../components/SegmentedControl";
import DecorativeBackground from "../../components/DecorativeBackground";
import { ensureArray } from "../../utils/ensureArray";

export default function FocusScreen(props: any) {
	// existing state and variables
	const presets = props.presets || [];
	const durations = props.durations || [];
	const sessions = props.sessions || [];
	const user = props.user || {};

	// normalize arrays to avoid map(undefined)
	const safePresets = ensureArray(presets); // presets coming from store/firestore
	const safeDurations = ensureArray(durations); // durations array if any
	const safeSessions = ensureArray(sessions); // previous focus sessions list
	const safeFlowersUnlocked = ensureArray(user?.flowersUnlocked);
	const durationLabels = safeDurations.map((d: any) => String(d)); // skapa label

	// render UI
	return (
			<View style={{ flex: 1 }}>
				<DecorativeBackground />
				{/* presets */}
				{safePresets.map((p) => (
					<View key={p.id}>{/* render preset item */}</View>
				))}
				{/* durations */}
				<SegmentedControl options={durationLabels} value={String(selectedDuration)} onChange={(v) => setSelectedDuration(Number(v))} />
				{/* sessions list */}
				{safeSessions.map((s) => (
					<View key={s.id}>{/* render session item */}</View>
				))}
			</View>
	);
}
