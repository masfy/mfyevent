'use client';

import React, { useState, useMemo } from 'react';
import { AnalyticsRecord } from '@/types';
import { MOCK_TRAFFIC_7D, MOCK_TRAFFIC_14D, MOCK_TRAFFIC_30D } from '@/lib/mockData';
import {
  MousePointerClick,
  Eye,
  TrendingUp,
  Zap,
  Calendar,
  BarChart3,
  Activity,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export interface TrafficTrendChartProps {
  initialRange?: '7d' | '14d' | '30d';
  title?: string;
  subtitle?: string;
  platformLevel?: boolean;
}

type ViewMetric = 'all' | 'clicks' | 'pageviews';
type ChartStyle = 'area' | 'bar';
type TimeRange = '7d' | '14d' | '30d';

export const TrafficTrendChart: React.FC<TrafficTrendChartProps> = ({
  initialRange = '14d',
  title = 'Tren Lalu Lintas Harian',
  subtitle = 'Grafik interaktif klik tautan & pageviews',
  platformLevel = false,
}) => {
  const [range, setRange] = useState<TimeRange>(initialRange);
  const [viewMetric, setViewMetric] = useState<ViewMetric>('all');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('area');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Active dataset with clicks and calculated pageviews
  const activeData = useMemo(() => {
    const raw =
      range === '7d'
        ? MOCK_TRAFFIC_7D
        : range === '30d'
        ? MOCK_TRAFFIC_30D
        : MOCK_TRAFFIC_14D;

    return raw.map((d) => {
      // Platform-level multiplier if looking at overall admin metrics
      const mult = platformLevel ? 3.4 : 1;
      const clicks = Math.round(d.clicks * mult);
      // Pageviews typically exceed unique visitors
      const pageviews = Math.round(d.visitors * 1.62 * mult);
      return {
        date: d.date,
        clicks,
        pageviews,
        visitors: Math.round(d.visitors * mult),
      };
    });
  }, [range, platformLevel]);

  // Aggregate metrics
  const totals = useMemo(() => {
    if (!activeData || activeData.length === 0) {
      return { clicks: 0, pageviews: 0, peakDay: null, avgCtr: '0%' };
    }
    const totalClicks = activeData.reduce((acc, d) => acc + d.clicks, 0);
    const totalPageviews = activeData.reduce((acc, d) => acc + d.pageviews, 0);

    let peak = activeData[0];
    for (const d of activeData) {
      if (d.clicks + d.pageviews > peak.clicks + peak.pageviews) {
        peak = d;
      }
    }

    const ctr =
      totalPageviews > 0
        ? ((totalClicks / totalPageviews) * 100).toFixed(1) + '%'
        : '0%';

    return { clicks: totalClicks, pageviews: totalPageviews, peakDay: peak, avgCtr: ctr };
  }, [activeData]);

  // Geometry dimensions
  const width = 860;
  const height = 260;
  const padLeft = 14;
  const padRight = 14;
  const padTop = 20;
  const padBottom = 20;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const maxVal = useMemo(() => {
    const vals: number[] = [];
    activeData.forEach((d) => {
      if (viewMetric === 'all' || viewMetric === 'clicks') vals.push(d.clicks);
      if (viewMetric === 'all' || viewMetric === 'pageviews') vals.push(d.pageviews);
    });
    const rawMax = Math.max(...vals, 0);
    const m = rawMax === 0 ? 10 : rawMax;
    // Add 15% headroom for aesthetic spacing
    return Math.max(Math.ceil((m * 1.15) / 10) * 10, 10);
  }, [activeData, viewMetric]);

  // Calculate points
  const points = useMemo(() => {
    const len = activeData.length;
    return activeData.map((d, i) => {
      const x = padLeft + (i / (len - 1 || 1)) * chartWidth;
      const yClicks = padTop + chartHeight - (d.clicks / maxVal) * chartHeight;
      const yPageviews = padTop + chartHeight - (d.pageviews / maxVal) * chartHeight;
      return { x, yClicks, yPageviews, d, index: i };
    });
  }, [activeData, maxVal, chartWidth, chartHeight, padLeft, padTop]);

  // Smooth Catmull-Rom spline generator
  const buildSmoothSpline = (pts: { x: number; y: number }[]): string => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const tension = 0.32;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const clickPoints = points.map((p) => ({ x: p.x, y: p.yClicks }));
  const pageviewsPoints = points.map((p) => ({ x: p.x, y: p.yPageviews }));

  const clicksLinePath = buildSmoothSpline(clickPoints);
  const pageviewsLinePath = buildSmoothSpline(pageviewsPoints);

  const clicksAreaPath = points.length
    ? `${clicksLinePath} L ${points[points.length - 1].x} ${padTop + chartHeight} L ${points[0].x} ${padTop + chartHeight} Z`
    : '';
  const pageviewsAreaPath = points.length
    ? `${pageviewsLinePath} L ${points[points.length - 1].x} ${padTop + chartHeight} L ${points[0].x} ${padTop + chartHeight} Z`
    : '';

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="bg-white dark:bg-[#0F172A] p-5 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-300">
      {/* 1. Header Bar: Title, Filters & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5B5BF7] to-[#06B6D4] flex items-center justify-center text-white shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{title}</span>
                {platformLevel && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-[#5B5BF7] dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
                    Sistem Admin
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Interactive Controls Strip */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Metric View Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold">
            <button
              onClick={() => setViewMetric('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMetric === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Semua</span>
            </button>
            <button
              onClick={() => setViewMetric('clicks')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMetric === 'clicks'
                  ? 'bg-white dark:bg-slate-900 text-[#5B5BF7] dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#5B5BF7]" />
              <span>Klik</span>
            </button>
            <button
              onClick={() => setViewMetric('pageviews')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMetric === 'pageviews'
                  ? 'bg-white dark:bg-slate-900 text-[#06B6D4] dark:text-cyan-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
              <span>Views</span>
            </button>
          </div>

          {/* Chart Style Switcher (Spline Curve vs Dual Bar) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
            <button
              onClick={() => setChartStyle('area')}
              title="Grafik Garis Area (Spline)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartStyle === 'area'
                  ? 'bg-white dark:bg-slate-900 text-[#5B5BF7] dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartStyle('bar')}
              title="Grafik Batang (Dual Bars)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartStyle === 'bar'
                  ? 'bg-white dark:bg-slate-900 text-[#06B6D4] dark:text-cyan-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold">
            <button
              onClick={() => setRange('7d')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                range === '7d'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setRange('14d')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                range === '14d'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              14 Hari
            </button>
            <button
              onClick={() => setRange('30d')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                range === '30d'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              30 Hari
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Glance Bar (Kilas Performa) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-5">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5B5BF7]" />
              Total Klik Tautan
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              totals.clicks > 0
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
            }`}>
              {totals.clicks > 0 ? '+16.8%' : '0%'}
            </span>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatNumber(totals.clicks)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
              Total Pageviews
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              totals.pageviews > 0
                ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60'
                : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
            }`}>
              {totals.pageviews > 0 ? '+24.3%' : '0%'}
            </span>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatNumber(totals.pageviews)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-500" />
            Hari Puncak (Peak Day)
          </span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
            {totals.peakDay && (totals.peakDay.clicks > 0 || totals.peakDay.pageviews > 0) ? (
              <>
                {totals.peakDay.date}
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1.5">
                  ({formatNumber(totals.peakDay.clicks)} klik)
                </span>
              </>
            ) : (
              <span className="text-slate-400 text-xs font-normal">Belum ada aktivitas</span>
            )}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ArrowUpRight className="w-3 h-3 text-[#5B5BF7]" />
            Rasio Klik/Tayang (CTR)
          </span>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {totals.avgCtr}
          </p>
        </div>
      </div>

      {/* 3. Main Chart Canvas Area */}
      <div className="relative pt-2">
        {/* Y-Axis Reference Guide Lines & Labels */}
        <div className="absolute inset-x-0 top-0 h-[260px] pointer-events-none flex flex-col justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500">
          {[1, 0.75, 0.5, 0.25, 0].map((ratio) => {
            const val = Math.round(maxVal * ratio);
            const label = val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val;
            return (
              <div key={ratio} className="w-full flex items-center gap-2">
                <span className="w-9 text-right shrink-0">{label}</span>
                <div className="flex-1 border-b border-dashed border-slate-200 dark:border-slate-800/80" />
              </div>
            );
          })}
        </div>

        {/* Interactive Drawing Container */}
        <div
          className="relative ml-10 h-[260px] cursor-crosshair select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {chartStyle === 'area' ? (
            /* ================= MODE 1: AREA SPLINE CURVE ================= */
            <>
              <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  {/* Glowing Gradients */}
                  <linearGradient id="trendClicksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5B5BF7" stopOpacity="0.38" />
                    <stop offset="60%" stopColor="#5B5BF7" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#5B5BF7" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="trendViewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.32" />
                    <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Pageviews Area & Line */}
                {(viewMetric === 'all' || viewMetric === 'pageviews') && (
                  <>
                    <path d={pageviewsAreaPath} fill="url(#trendViewsGrad)" />
                    <path
                      d={pageviewsLinePath}
                      fill="none"
                      stroke="#06B6D4"
                      strokeWidth="2.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {/* Clicks Area & Line */}
                {(viewMetric === 'all' || viewMetric === 'clicks') && (
                  <>
                    <path d={clicksAreaPath} fill="url(#trendClicksGrad)" />
                    <path
                      d={clicksLinePath}
                      fill="none"
                      stroke="#5B5BF7"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}
              </svg>

              {/* Scrubber Laser Line & Dots (Rendered in DOM for 100% Round Geometric Circles) */}
              {points.map((pt, idx) => {
                const isHovered = hoveredIndex === idx;
                const leftPercent = (pt.x / width) * 100;
                const yClicksPercent = (pt.yClicks / height) * 100;
                const yViewsPercent = (pt.yPageviews / height) * 100;

                return (
                  <React.Fragment key={idx}>
                    {/* Hover Laser Line */}
                    {isHovered && (
                      <div
                        style={{ left: `${leftPercent}%` }}
                        className="absolute top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-indigo-500 via-cyan-400 to-transparent pointer-events-none -translate-x-1/2 z-10"
                      />
                    )}

                    {/* Pageviews Dot */}
                    {(viewMetric === 'all' || viewMetric === 'pageviews') && (
                      <div
                        style={{
                          left: `${leftPercent}%`,
                          top: `${yViewsPercent}%`,
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-150 z-20 ${
                          isHovered
                            ? 'w-4 h-4 bg-white dark:bg-[#0F172A] border-[3px] border-[#06B6D4] shadow-[0_0_12px_#06B6D4]'
                            : 'w-2 h-2 bg-[#06B6D4] ring-2 ring-white dark:ring-[#0F172A]'
                        }`}
                      />
                    )}

                    {/* Clicks Dot */}
                    {(viewMetric === 'all' || viewMetric === 'clicks') && (
                      <div
                        style={{
                          left: `${leftPercent}%`,
                          top: `${yClicksPercent}%`,
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-150 z-20 ${
                          isHovered
                            ? 'w-4.5 h-4.5 bg-white dark:bg-[#0F172A] border-[3.5px] border-[#5B5BF7] shadow-[0_0_14px_#5B5BF7]'
                            : 'w-2.5 h-2.5 bg-[#5B5BF7] ring-2 ring-white dark:ring-[#0F172A]'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            /* ================= MODE 2: MODERN DUAL BARS ================= */
            <div className="w-full h-full flex items-end justify-between gap-1.5 sm:gap-2.5 pb-2">
              {activeData.map((d, idx) => {
                const isHovered = hoveredIndex === idx;
                const clicksHeight = Math.min(100, Math.round((d.clicks / maxVal) * 100));
                const viewsHeight = Math.min(100, Math.round((d.pageviews / maxVal) * 100));

                return (
                  <div
                    key={idx}
                    className="flex-1 h-full flex items-end justify-center gap-1 group relative"
                  >
                    {/* Clicks Bar */}
                    {(viewMetric === 'all' || viewMetric === 'clicks') && (
                      <div
                        style={{ height: `${clicksHeight}%` }}
                        className={`w-full max-w-[20px] rounded-t-lg bg-gradient-to-t from-[#5B5BF7] to-[#818CF8] transition-all ${
                          isHovered ? 'brightness-125 shadow-[0_0_12px_#5B5BF7]' : 'opacity-90'
                        }`}
                      />
                    )}

                    {/* Pageviews Bar */}
                    {(viewMetric === 'all' || viewMetric === 'pageviews') && (
                      <div
                        style={{ height: `${viewsHeight}%` }}
                        className={`w-full max-w-[20px] rounded-t-lg bg-gradient-to-t from-[#06B6D4] to-[#22D3EE] transition-all ${
                          isHovered ? 'brightness-125 shadow-[0_0_12px_#06B6D4]' : 'opacity-85'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Invisible Transparent Hover Catchers for Responsive Tracking */}
          <div className="absolute inset-0 flex">
            {points.map((pt, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                className="flex-1 h-full cursor-pointer z-30"
              />
            ))}
          </div>

          {/* Rich Floating Tooltip */}
          {hoveredPoint && (
            <div
              style={{
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `18%`,
              }}
              className={`absolute pointer-events-none z-40 transition-all duration-100 -translate-y-1/2 ${
                hoveredPoint.index > points.length / 2
                  ? '-translate-x-[105%]'
                  : 'translate-x-3'
              }`}
            >
              <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl min-w-[190px] text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    {hoveredPoint.d.date} 2026
                  </span>
                  {totals.peakDay?.date === hoveredPoint.d.date && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      Peak Day 🔥
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5B5BF7]" />
                      Klik Tautan:
                    </span>
                    <span className="font-extrabold text-[#5B5BF7] dark:text-indigo-400">
                      {formatNumber(hoveredPoint.d.clicks)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
                      Pageviews:
                    </span>
                    <span className="font-extrabold text-[#06B6D4] dark:text-cyan-400">
                      {formatNumber(hoveredPoint.d.pageviews)}
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Rasio Konversi:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {(
                        (hoveredPoint.d.clicks / (hoveredPoint.d.pageviews || 1)) *
                        100
                      ).toFixed(1)}
                      % CTR
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. X-Axis Date Labels Strip */}
        <div className="ml-10 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500">
          {activeData.map((d, i) => {
            // Filter labels on dense mobile views
            const showOnMobile =
              range === '30d' ? i % 4 === 0 : range === '14d' ? i % 2 === 0 : true;
            return (
              <span
                key={i}
                className={`transition-colors text-center ${
                  hoveredIndex === i
                    ? 'text-[#5B5BF7] dark:text-indigo-400 font-bold scale-110'
                    : ''
                } ${showOnMobile ? 'block' : 'hidden sm:block'}`}
              >
                {d.date}
              </span>
            );
          })}
        </div>
      </div>

      {/* 5. Bottom Insights & Micro-legend */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4 font-semibold">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#5B5BF7] to-[#818CF8] shadow-[0_0_8px_#5B5BF7]" />
            Klik Tautan (Short Link)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] shadow-[0_0_8px_#06B6D4]" />
            Pageviews (Microsite)
          </span>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
          💡 Arahkan kursor atau sentuh titik untuk rincian real-time & analitik konversi.
        </p>
      </div>
    </div>
  );
};
