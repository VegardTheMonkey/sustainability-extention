import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import extractDominantColor, { generateRandomColor } from '../utils/extractDominantColor';
import { co2 } from '@tgwf/co2';
import { calculateEfficiencyGrade, getFormattedBytesPerPixel } from '../utils/bytePerPixel';

// Register required Chart.js components console.log
ChartJS.register(ArcElement, Tooltip, Legend);

// Custom tooltip component with image
const getOrCreateTooltip = (chart) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div.customTooltip');
  
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'customTooltip';
    tooltipEl.style.opacity = 0;
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.transition = 'all .1s ease';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltipEl.style.color = 'white';
    tooltipEl.style.borderRadius = '5px';
    tooltipEl.style.padding = '10px';
    tooltipEl.style.maxWidth = '200px';
    tooltipEl.style.zIndex = 999;
    tooltipEl.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    
    chart.canvas.parentNode.appendChild(tooltipEl);
  }
  
  return tooltipEl;
};

const PieChart = ({ images, onImageSelect }) => {
  const [dominantColors, setDominantColors] = useState({});
  const [isLoadingColors, setIsLoadingColors] = useState(true);
  const [co2Emission, setCo2Emission] = useState(null);
  
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
  
  // Calculate CO2 emissions
  useEffect(() => {
    if (totalSize > 0) {
      // Create a new CO2 instance
      const emissions = new co2();
      

      const totalCO2 = emissions.perByte(totalSize * 1000, true);
      
      setCo2Emission(totalCO2);
    }
  }, [totalSize]);
  
  // Group images into regular and "Other" categories
  const threshold = totalSize * 0.04; // 4% threshold
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
  
  // Load dominant colors when component mounts
  useEffect(() => {
    const loadColors = async () => {
      setIsLoadingColors(true);
      const colorMap = {};
      
      for (const image of regularImages) {
        try {
          const color = await extractDominantColor(image.url);
          colorMap[image.url] = color;
        } catch (error) {
          console.error('Error extracting color:', error);
          colorMap[image.url] = generateRandomColor();
        }
      }
      
      setDominantColors(colorMap);
      setIsLoadingColors(false);
    };
    
    loadColors();
  }, [JSON.stringify(regularImages.map(img => img.url))]);
  
  // Get colors from state or generate random ones as fallback
  const colors = regularImages.map(img => 
    dominantColors[img.url] || generateRandomColor()
  );
  
  // If we have "Other" category, add grey color for it
  if (otherSize > 0) {
    colors.push('rgb(169, 169, 169)'); // Grey color for "Other"
  }
  
  // Create URL lookup for fast image retrieval during hover
  const imageUrlLookup = {};
  const imageObjectLookup = {};
  regularImages.forEach(img => {
    const fileName = img.url.split('/').pop() || 'Image';
    const sizeInKB = (img.size / 1024).toFixed(2);
    const label = `${fileName} (${sizeInKB} KB)`;
    imageUrlLookup[label] = img.url;
    imageObjectLookup[label] = img; // Store the whole image object for grade calculation
  });
  
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
        borderColor: 'grey',
      },
    ],
  };
  
  // Function to handle click on a chart segment
  const handleChartClick = (event, elements) => {
    if (elements.length > 0) {
      const clickedIndex = elements[0].index;
      const label = chartData.labels[clickedIndex];
      
      // Don't select the "Other" category
      if (!label.startsWith('Other')) {
        // Find the corresponding image
        const selectedImage = regularImages[clickedIndex];
        if (selectedImage && onImageSelect) {
          // Send message to content script with more detailed information
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'imageSelected',
              image: selectedImage,
              elementTag: selectedImage.elementTag
            });
          });
          
          onImageSelect(selectedImage);
        }
      }
    }
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          padding: 10,
          font: {
            size: 10
          },
          filter: (legendItem) => {
            return legendItem.text.startsWith('Other');
          }
        }
      },
      tooltip: {
        enabled: false, // Disable default tooltip
        external: (context) => {
          // Get tooltip element
          const {chart, tooltip} = context;
          const tooltipEl = getOrCreateTooltip(chart);
          
          // Hide if no tooltip
          if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
          }
          
          // Get data
          if (tooltip.body) {
            const dataIndex = tooltip.dataPoints[0].dataIndex;
            const label = chartData.labels[dataIndex];
            const percentage = ((chartData.datasets[0].data[dataIndex] / totalSize) * 100).toFixed(2);
            const imgUrl = imageUrlLookup[label];
            const imgObject = imageObjectLookup[label];
            
            // Create tooltip content
            let tooltipContent = `${percentage}%</div>`;
            
            // Add image thumbnail and efficiency grade if it's not the "Other" category
            if (imgUrl && imgObject) {
              const grade = calculateEfficiencyGrade(imgObject);
              const bytesPerPixel = getFormattedBytesPerPixel(imgObject);
              
              tooltipContent = `
                <div style="text-align: center; margin-bottom: 5px;">
                  <img 
                    src="${imgUrl}" 
                    alt="Image thumbnail" 
                    style="max-width: 150px; max-height: 100px; border: 1px solid #ddd;"
                  />
                </div>
                <div style="text-align: center; margin-bottom: 4px;">
                  <strong>Grade: ${grade}</strong>
                </div>
                ${bytesPerPixel ? `<div style="text-align: center; font-size: 0.9em; color: #ccc;">
                  ${bytesPerPixel} bytes/pixel
                </div>` : ''}
                <div style="text-align: center; margin-top: 4px;">
                  ${percentage}%
                </div>
              `;
            }
            
            tooltipEl.innerHTML = tooltipContent;
          }
          
          // Position the tooltip
          const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;
          
          tooltipEl.style.opacity = 1;
          tooltipEl.style.left = positionX + tooltip.caretX + 'px';
          tooltipEl.style.top = positionY + tooltip.caretY + 'px';
        }
      }
    },
    onClick: handleChartClick 
  };

  return (
    <div className="pie-chart-container">
      <h4>Image Size Distribution <span className="click-hint">(Click a slice to view details)</span></h4>
      {isLoadingColors ? (
        <div className="loading-colors">Extracting dominant colors...</div>
      ) : (
        <>
          <Pie data={chartData} options={options} />
          
          {co2Emission !== null && (
            <div className="co2-info">
              <p>
                The total size of images ({(totalSize / 1024).toFixed(2)} KB) produces approximately{' '}
                <strong>{co2Emission.toFixed(6)} grams</strong> of CO2 emissions per thousand visits.
              </p>
              <p className="eco-tip">
                💡 Optimizing image sizes can help reduce your website's carbon footprint.
              </p>
            </div>
          )}
        </>
      )}
      <style jsx>{`
        .pie-chart-container {
          max-width: 500px;
          margin: 0 auto 20px;
          position: relative;
        }
        h4 {
          text-align: center;
          margin-bottom: 10px;
        }
        .click-hint {
          font-size: 0.8em;
          font-weight: normal;
          color: #666;
          font-style: italic;
        }
        .loading-colors {
          text-align: center;
          margin: 20px 0;
          font-style: italic;
          color: #666;
        }
        .co2-info {
          margin-top: 15px;
          padding: 10px;
          background-color: #f5f9f5;
          border-radius: 5px;
          border-left: 4px solid #4CAF50;
          font-size: 0.9em;
        }
        .eco-tip {
          margin-top: 8px;
          font-style: italic;
          color: #4CAF50;
        }
      `}</style>
    </div>
  );
};

export default PieChart;
