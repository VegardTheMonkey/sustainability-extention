import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ images }) => {
  // Reset and properly calculate image sizes
  const processedImages = images.map(image => {
    // Ensure size is a valid number
    return {
      ...image,
      size: typeof image.size === 'number' ? image.size : 
            (typeof image.size === 'string' ? parseInt(image.size, 10) : 0)
    };
  });
  
  console.log('Processed images:', processedImages);
  
  // Calculate total size with clean data
  const totalSize = processedImages.reduce((sum, image) => sum + image.size, 0);
  console.log('Total size:', totalSize);
  
  // Group images into regular and "Other" categories
  const threshold = totalSize * 0.03; // 3% threshold
  console.log('Threshold:', threshold);
  
  const regularImages = [];
  let otherSize = 0;
  
  processedImages.forEach(image => {
    console.log(`Image ${image.url}: size=${image.size}, threshold=${threshold}`);
    
    if (image.size >= threshold) {
      regularImages.push(image);
    } else if (image.size > 0) { // Only add to otherSize if it's positive
      otherSize += image.size;
    }
  });
  
  console.log('Regular images count:', regularImages.length);
  console.log('Other size total:', otherSize);
  
  // Generate random colors for each regular image
  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 200); // Using 200 instead of 255 for better visibility
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  const colors = regularImages.map(() => generateRandomColor());
  
  // If we have "Other" category, add grey color for it
  if (otherSize > 0) {
    colors.push('rgb(169, 169, 169)'); // Grey color for "Other"
  }
  
  // Prepare data for the chart
  const chartData = {
    labels: [
      ...regularImages.map(img => {
        const fileName = img.url.split('/').pop() || 'Image';
        const sizeInKB = (img.size / 1024).toFixed(2);
        return `${fileName} (${sizeInKB} KB)`;
      }),
      ...(otherSize > 0 ? [`Other (${(otherSize / 1024).toFixed(2)} KB)`] : [])
    ],
    datasets: [
      {
        data: [
          ...regularImages.map(img => img.size),
          ...(otherSize > 0 ? [otherSize] : [])
        ],
        backgroundColor: colors,
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 10,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = ((value / totalSize) * 100).toFixed(2);
            return `${label}: ${percentage}%`;
          }
        }
      }
    },
  };

  return (
    <div className="pie-chart-container">
      <h4>Image Size Distribution</h4>
      <Pie data={chartData} options={options} />
      <style jsx>{`
        .pie-chart-container {
          max-width: 500px;
          margin: 0 auto 20px;
        }
        h4 {
          text-align: center;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default PieChart;
