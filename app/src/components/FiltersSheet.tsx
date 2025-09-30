import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_FILTERS, usePreferences } from '../context/PreferencesContext';
import { PriceLevel } from '../types/restaurant';

interface FiltersSheetProps {
  visible: boolean;
  onClose: () => void;
}

const radiusOptions = [500, 1000, 2000, 3000];
const ratingOptions = [4.0, 4.2, 4.5];
const userRatingOptions = [50, 100];
const priceOptions: Array<{ label: string; value: PriceLevel }> = [
  { label: '$', value: 0 },
  { label: '$$', value: 1 },
  { label: '$$$', value: 2 },
  { label: '$$$$', value: 3 },
];

const categoryOptions = ['台式', '小吃', '咖啡', '日式', '韓式', '義式', '泰式', '素食', '早午餐', '甜點'];

const FiltersSheet: React.FC<FiltersSheetProps> = ({ visible, onClose }) => {
  const { filters, setFilters } = usePreferences();
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const togglePrice = (value: PriceLevel) => {
    setDraft((prev) => ({
      ...prev,
      priceLevels: prev.priceLevels.includes(value)
        ? prev.priceLevels.filter((price) => price !== value)
        : [...prev.priceLevels, value].sort((a, b) => a - b),
    }));
  };

  const toggleCategory = (category: string) => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((item) => item !== category)
        : [...prev.categories, category],
    }));
  };

  const apply = () => {
    setFilters(draft);
    onClose();
  };

  const reset = () => {
    setDraft({ ...DEFAULT_FILTERS, excludedPlaceIds: filters.excludedPlaceIds });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>調整條件</Text>
          <ScrollView contentContainerStyle={styles.content}>
            <Section title="距離">
              <OptionRow
                options={radiusOptions.map((radius) => ({
                  label: radius < 1000 ? `${radius} 公尺` : `${radius / 1000} 公里`,
                  value: radius,
                }))}
                selectedValue={draft.radiusMeters}
                onSelect={(value) => setDraft((prev) => ({ ...prev, radiusMeters: value }))}
              />
            </Section>
            <Section title="評分下限">
              <OptionRow
                options={ratingOptions.map((rating) => ({ label: rating.toFixed(1), value: rating }))}
                selectedValue={draft.minRating}
                onSelect={(value) => setDraft((prev) => ({ ...prev, minRating: value }))}
              />
            </Section>
            <Section title="評論數下限">
              <OptionRow
                options={userRatingOptions.map((count) => ({ label: `${count}+`, value: count }))}
                selectedValue={draft.minUserRatings}
                onSelect={(value) => setDraft((prev) => ({ ...prev, minUserRatings: value }))}
              />
            </Section>
            <Section title="價格帶">
              <TagGrid
                options={priceOptions.map((option) => ({ label: option.label, value: option.value }))}
                selected={draft.priceLevels}
                onToggle={togglePrice}
              />
            </Section>
            <Section title="類別">
              <TagGrid options={categoryOptions.map((item) => ({ label: item, value: item }))} selected={draft.categories} onToggle={toggleCategory} />
            </Section>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>只顯示營業中</Text>
              <Pressable
                style={[styles.toggle, draft.openNow ? styles.toggleOn : styles.toggleOff]}
                onPress={() => setDraft((prev) => ({ ...prev, openNow: !prev.openNow }))}
              >
                <View style={[styles.knob, draft.openNow && styles.knobOn]} />
              </Pressable>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Pressable style={[styles.footerButton, styles.secondaryButton]} onPress={reset}>
              <Text style={styles.footerButtonText}>重置</Text>
            </Pressable>
            <Pressable style={[styles.footerButton, styles.primaryButton]} onPress={apply}>
              <Text style={[styles.footerButtonText, styles.primaryButtonText]}>套用</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

interface OptionRowProps<T> {
  options: Array<{ label: string; value: T }>;
  selectedValue: T;
  onSelect: (value: T) => void;
}

const OptionRow = <T,>({ options, selectedValue, onSelect }: OptionRowProps<T>) => (
  <View style={styles.optionRow}>
    {options.map((option) => (
      <Pressable
        key={option.label}
        style={[styles.chip, option.value === selectedValue && styles.chipSelected]}
        onPress={() => onSelect(option.value)}
      >
        <Text style={[styles.chipText, option.value === selectedValue && styles.chipTextSelected]}>
          {option.label}
        </Text>
      </Pressable>
    ))}
  </View>
);

interface TagGridProps<T> {
  options: Array<{ label: string; value: T }>;
  selected: T[];
  onToggle: (value: T) => void;
}

const TagGrid = <T,>({ options, selected, onToggle }: TagGridProps<T>) => (
  <View style={styles.tagGrid}>
    {options.map((option) => (
      <Pressable
        key={option.label}
        style={[styles.tag, selected.includes(option.value) && styles.tagSelected]}
        onPress={() => onToggle(option.value)}
      >
        <Text style={[styles.tagText, selected.includes(option.value) && styles.tagTextSelected]}>
          {option.label}
        </Text>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  content: {
    paddingBottom: 24,
    gap: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  chipSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  chipText: {
    color: '#374151',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  tagSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  tagText: {
    color: '#374151',
  },
  tagTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#111827',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 999,
    padding: 4,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: '#34d399',
    alignItems: 'flex-end',
  },
  toggleOff: {
    backgroundColor: '#d1d5db',
    alignItems: 'flex-start',
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  knobOn: {
    backgroundColor: '#ecfdf5',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  footerButtonText: {
    color: '#111827',
    fontSize: 16,
  },
});

export default FiltersSheet;
