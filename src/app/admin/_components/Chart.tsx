'use client';

import { useMemo } from 'react';
import styles from './Chart.module.css';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie';
  title?: string;
  height?: number;
  width?: number;
}

export default function Chart({ data, type, title, height = 200, width = 400 }: ChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  const getBarHeight = (value: number) => {
    return (value / maxValue) * (height - 40);
  };

  const getColor = (index: number, customColor?: string) => {
    if (customColor) return customColor;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return colors[index % colors.length];
  };

  const renderBarChart = () => {
    const chartWidth = width - 50; // 양쪽 여백 제외 (40px + 10px)
    const totalSpacing = chartWidth * 0.2; // 전체 폭의 20%를 spacing으로 사용
    const totalBarWidth = chartWidth - totalSpacing;
    const barWidth = Math.max(20, totalBarWidth / data.length); // 최소 20px
    const spacing = data.length > 1 ? totalSpacing / (data.length + 1) : totalSpacing / 2;

    return (
      <div className={styles.chartContainer}>
        <svg width={width} height={height} className={styles.chart}>
          {/* Y축 그리드 라인 */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={40}
              y1={height - 30 - ratio * (height - 40)}
              x2={width - 10}
              y2={height - 30 - ratio * (height - 40)}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          ))}
          
          {/* 막대 그래프 */}
          {data.map((item, index) => (
            <g key={item.label}>
              <rect
                x={40 + spacing + index * (barWidth + spacing)}
                y={height - 30 - getBarHeight(item.value)}
                width={barWidth}
                height={getBarHeight(item.value)}
                fill={getColor(index, item.color)}
                className={styles.bar}
              />
              
              {/* 값 표시 */}
              <text
                x={40 + spacing + index * (barWidth + spacing) + barWidth / 2}
                y={height - 35 - getBarHeight(item.value)}
                textAnchor="middle"
                className={styles.valueText}
              >
                {item.value.toLocaleString()}
              </text>
            </g>
          ))}
          
          {/* X축 라벨 */}
          {data.map((item, index) => (
            <text
              key={`label-${index}`}
              x={40 + spacing + index * (barWidth + spacing) + barWidth / 2}
              y={height - 10}
              textAnchor="middle"
              className={styles.labelText}
            >
              {item.label}
            </text>
          ))}
          
          {/* Y축 라벨 */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <text
              key={`y-label-${ratio}`}
              x={35}
              y={height - 25 - ratio * (height - 40)}
              textAnchor="end"
              className={styles.axisText}
            >
              {Math.round(maxValue * ratio).toLocaleString()}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  const renderLineChart = () => {
    const pointSpacing = (width - 80) / (data.length - 1);

    const points = data.map((item, index) => ({
      x: 40 + index * pointSpacing,
      y: height - 30 - getBarHeight(item.value)
    }));

    const pathData = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    return (
      <div className={styles.chartContainer} style={{ height, width }}>
        <svg width={width} height={height} className={styles.chart}>
          {/* Y축 그리드 라인 */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={40}
              y1={height - 30 - ratio * (height - 40)}
              x2={width - 40}
              y2={height - 30 - ratio * (height - 40)}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          ))}
          
          {/* 라인 */}
          <path
            d={pathData}
            fill="none"
            stroke={getColor(0)}
            strokeWidth={3}
            className={styles.line}
          />
          
          {/* 데이터 포인트 */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={getColor(0)}
              className={styles.point}
            />
          ))}
          
          {/* X축 라벨 */}
          {data.map((item, index) => (
            <text
              key={`label-${index}`}
              x={40 + index * pointSpacing}
              y={height - 10}
              textAnchor="middle"
              className={styles.labelText}
            >
              {item.label}
            </text>
          ))}
          
          {/* Y축 라벨 */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <text
              key={`y-label-${ratio}`}
              x={35}
              y={height - 25 - ratio * (height - 40)}
              textAnchor="end"
              className={styles.axisText}
            >
              {Math.round(maxValue * ratio).toLocaleString()}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  const renderPieChart = () => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    let currentAngle = -90; // 12시 방향부터 시작

    return (
      <div className={styles.chartContainer} style={{ height, width }}>
        <svg width={width} height={height} className={styles.chart}>
          {data.map((item, index) => {
            const percentage = item.value / total;
            const angle = percentage * 360;
            
            const startAngleRad = (currentAngle * Math.PI) / 180;
            const endAngleRad = ((currentAngle + angle) * Math.PI) / 180;
            
            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            return (
              <path
                key={item.label}
                d={pathData}
                fill={getColor(index, item.color)}
                className={styles.pieSlice}
              />
            );
          })}
        </svg>
        
        {/* 범례 */}
        <div className={styles.legend}>
          {data.map((item, index) => (
            <div key={item.label} className={styles.legendItem}>
              <div 
                className={styles.legendColor}
                style={{ backgroundColor: getColor(index, item.color) }}
              ></div>
              <span className={styles.legendLabel}>{item.label}</span>
              <span className={styles.legendValue}>
                {item.value.toLocaleString()} ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {type === 'bar' && renderBarChart()}
      {type === 'line' && renderLineChart()}
      {type === 'pie' && renderPieChart()}
    </div>
  );
}
