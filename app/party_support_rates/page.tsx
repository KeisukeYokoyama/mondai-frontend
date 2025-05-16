'use client';

import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import { PartySupportRate } from '@/types/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Header from '@/components/Navs/Header';
import Footer from '@/components/Navs/Footer';

const ALL_PARTIES = [
  '自民', '立民', '維新', '公明', '国民', '共産', 'れいわ', '参政', '保守', '社民', 'その他の政治団体', '特になし', 'わからない・無回答'
];
const ATTR_TYPES = [
  { value: 'age_group', label: '年齢層' },
  { value: 'gender', label: '性別' },
  { value: 'total', label: '全体' }
];

// レーダーチャートのデータ型を定義
interface RadarDataItem {
  属性: string;
  [key: string]: string | number;
}

// 政党名を短く表示する関数
const getShortPartyName = (partyName: string): string => {
  if (partyName === 'わからない・無回答') return '無回答';
  return partyName;
};

const PartySupportRates: React.FC = () => {
  const [data, setData] = useState<PartySupportRate[]>([]);
  const [year, setYear] = useState<number>(2025);
  const [month, setMonth] = useState<number>(() => {
    const now = new Date();
    return now.getMonth() === 0 ? 12 : now.getMonth();
  });
  const [attributeType, setAttributeType] = useState<string>('age_group');
  const [selectedParties, setSelectedParties] = useState<string[]>(['自民', '立民']);
  const [allAttributes, setAllAttributes] = useState<string[]>([]);
  const [ageData, setAgeData] = useState<PartySupportRate[]>([]);
  const [ageAttributes, setAgeAttributes] = useState<string[]>([]);

  // 月の選択肢を生成
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}月`
  }));

  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('party_support_rates')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .in('party_name', ALL_PARTIES)
        .eq('attribute_type', attributeType);
      if (error) {
        alert('データ取得エラー: ' + error.message);
        return;
      }
      setData(data as PartySupportRate[]);
      setAllAttributes(Array.from(new Set((data as PartySupportRate[]).map(d => d.attribute_value))));
    };
    fetchData();
  }, [year, month, attributeType]);

  useEffect(() => {
    const fetchAgeData = async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('party_support_rates')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .in('party_name', ALL_PARTIES)
        .eq('attribute_type', 'age_group');
      if (error) {
        alert('データ取得エラー: ' + error.message);
        return;
      }
      setAgeData(data as PartySupportRate[]);
      setAgeAttributes(Array.from(new Set((data as PartySupportRate[]).map(d => d.attribute_value))));
    };
    fetchAgeData();
  }, [year, month]);

  // データが存在する政党のみ抽出
  const partiesWithData = ALL_PARTIES.filter(party =>
    data.some(d => d.party_name === party)
  );

  // 1. ヒートマップ用データ（政党×属性）
  const heatmapData = partiesWithData.map(party =>
    allAttributes.map(attr => {
      const found = data.find(d => d.party_name === party && d.attribute_value === attr);
      return found ? Number(found.support_rate) : null;
    })
  );

  // 2. 類似度ヒートマップ（政党×政党）
  function cosineSimilarity(a: (number|null)[], b: (number|null)[]) {
    const vA = a.map(x => x ?? 0);
    const vB = b.map(x => x ?? 0);
    const normA = Math.sqrt(vA.reduce((sum, v) => sum + v * v, 0));
    const normB = Math.sqrt(vB.reduce((sum, v) => sum + v * v, 0));
    if (normA === 0 || normB === 0) return null; // データなし
    const dot = vA.reduce((sum, v, i) => sum + v * vB[i], 0);
    return dot / (normA * normB);
  }
  const similarityMatrix = partiesWithData.map((p1, i) =>
    partiesWithData.map((p2, j) =>
      cosineSimilarity(heatmapData[i], heatmapData[j])
    )
  );

  // 3. レーダーチャート用データ（年齢層のみ）
  const radarData = ageAttributes.map(attr => {
    const row: RadarDataItem = { 属性: attr };
    selectedParties.forEach(party => {
      // その政党の全属性合計
      const total = ageAttributes.reduce((sum, a) => {
        const found = ageData.find(d => d.party_name === party && d.attribute_value === a);
        return sum + (found ? Number(found.support_rate) : 0);
      }, 0);
      // この属性の値
      const found = ageData.find(d => d.party_name === party && d.attribute_value === attr);
      const value = found ? Number(found.support_rate) : 0;
      // 割合（%）
      row[party] = total > 0 ? (value / total) * 100 : 0;
    });
    return row;
  });

  // セル色付け関数
  const getCellColor = (value: number | null, max = 50) => {
    if (value == null) return '#eee';
    const alpha = Math.min(1, value / max);
    return `rgba(30, 136, 229, ${alpha})`;
  };
  const getSimCellColor = (value: number | null) => {
    if (value == null || isNaN(value)) return '#eee';
    return `rgba(76,175,80,${value})`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto max-w-screen-lg">
          <Header />
        </div>
      </section>
      <main className="w-full max-w-full overflow-x-hidden bg-white">
        <div className="container px-5 pt-8 mx-auto max-w-screen-lg">
          <h1 className="text-xl font-bold text-gray-900 mb-6">政党支持率比較</h1>
          <label className="text-gray-700 text-sm font-bold mb-2 block">データ年月を選択</label>
          <div className="flex gap-4 mb-4">
            <div className="w-24">
              <div className="relative">
                <select
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 appearance-none"
                >
                  <option value={2025}>2025年</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="w-24">
              <div className="relative">
                <select
                  value={month}
                  onChange={e => setMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 appearance-none"
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-gray-700 text-sm font-bold mb-2 block">属性</label>
            <div className="flex gap-6">
              {ATTR_TYPES.map(opt => (
                <label key={opt.value} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={opt.value}
                    checked={attributeType === opt.value}
                    onChange={e => setAttributeType(e.target.value)}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          {/* 1. ヒートマップ（政党×属性） */}
          <h2 className="font-bold mt-8 mb-2 text-lg">政党×属性 ヒートマップ <small className="text-gray-500 font-normal">(%)</small></h2>
          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th></th>
                  {allAttributes.map(attr => (
                    <th key={attr} style={{ padding: 4, fontSize: 12 }}>{attr}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partiesWithData.map((party, i) => (
                  <tr key={party}>
                    <td style={{ padding: 4, fontSize: 12, textAlign: 'right' }}>{getShortPartyName(party)}</td>
                    {allAttributes.map((attr, j) => {
                      const value = heatmapData[i][j];
                      return (
                        <td
                          key={attr}
                          style={{
                            background: getCellColor(value),
                            color: value && value > 25 ? '#fff' : '#222',
                            fontWeight: 600,
                            textAlign: 'center',
                            padding: 4,
                            minWidth: 40,
                          }}
                        >
                          {value == null ? '' : value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 2. 類似度ヒートマップ（政党×政党） */}
          <h2 className="font-bold mt-8 mb-2 text-lg">政党間 類似度ヒートマップ <small className="text-gray-500 font-normal">(コサイン類似度)</small></h2>
          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th></th>
                  {partiesWithData.map(party => (
                    <th key={party} style={{ padding: 4, fontSize: 12 }}>{getShortPartyName(party)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partiesWithData.map((party, i) => (
                  <tr key={party}>
                    <td style={{ padding: 4, fontSize: 12, textAlign: 'right' }}>{getShortPartyName(party)}</td>
                    {partiesWithData.map((other, j) => {
                      const value = similarityMatrix[i][j];
                      return (
                        <td
                          key={other}
                          style={{
                            background: getSimCellColor(value),
                            color: value != null && value > 0.7 ? '#fff' : '#222',
                            fontWeight: 600,
                            textAlign: 'center',
                            padding: 4,
                            minWidth: 40,
                          }}
                        >
                          {value == null || isNaN(value) ? '' : value.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 3. レーダーチャート（年齢層のみ） */}
          <h2 className="font-bold mt-8 mb-2 text-lg">政党の年齢層分布 <small className="text-gray-500 font-normal">(レーダーチャート)</small></h2>
          <div className="mb-4">
            <label className="text-gray-700 text-sm font-bold mb-2 block">比較する政党を複数選択</label>
            <div className="relative">
              <select
                multiple
                value={selectedParties}
                onChange={e => setSelectedParties(Array.from(e.target.selectedOptions, o => o.value))}
                className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 appearance-none"
                style={{ minHeight: 80 }}
              >
                {partiesWithData.map(party => <option key={party} value={party}>{getShortPartyName(party)}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData} outerRadius={150}>
              <PolarGrid />
              <PolarAngleAxis dataKey="属性" />
              <PolarRadiusAxis angle={30} domain={[0, 50]} />
              {selectedParties.map((party, idx) => (
                <Radar key={party} name={party} dataKey={party} stroke={["#1976d2", "#e53935"][idx]} fill={["#1976d2", "#e53935"][idx]} fillOpacity={0.3} />
              ))}
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PartySupportRates;
