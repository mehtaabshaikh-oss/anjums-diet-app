const fs = require('fs');
const path = require('path');

const filePath = './src/app/admin/clients/[id]/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Bug 2: Fix Body Measurements display - remove the conditional that hides it when empty
// Change the display section to show "-" for empty values like Health Metrics does
const oldBodyMeasurementsDisplay = `{profile.chest_cm && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Chest</p>
                      <p className="text-lg font-semibold text-gray-900">{profile.chest_cm} cm</p>
                    </div>
                  )}
                  {profile.waist_cm && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Waist</p>
                      <p className="text-lg font-semibold text-gray-900">{profile.waist_cm} cm</p>
                    </div>
                  )}
                  {profile.hip_cm && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Hip</p>
                      <p className="text-lg font-semibold text-gray-900">{profile.hip_cm} cm</p>
                    </div>
                  )}
                  {profile.thigh_cm && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Thigh</p>
                      <p className="text-lg font-semibold text-gray-900">{profile.thigh_cm} cm</p>
                    </div>
                  )}`;

const newBodyMeasurementsDisplay = `<div>
                    <p className="text-sm text-gray-600 mb-1">Chest</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.chest_cm || '−'} {profile.chest_cm ? 'cm' : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Waist</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.waist_cm || '−'} {profile.waist_cm ? 'cm' : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Hip</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.hip_cm || '−'} {profile.hip_cm ? 'cm' : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Thigh</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.thigh_cm || '−'} {profile.thigh_cm ? 'cm' : ''}</p>
                  </div>`;

content = content.replace(oldBodyMeasurementsDisplay, newBodyMeasurementsDisplay);

// Also remove the conditional that hides Body Measurements when empty
const oldBodyMeasurementsConditional = `{profile && ((isEditingProfile) || (profile.chest_cm || profile.waist_cm || profile.hip_cm || profile.thigh_cm)) && (`;
const newBodyMeasurementsConditional = `{profile && (`;

content = content.replace(oldBodyMeasurementsConditional, newBodyMeasurementsConditional);

fs.writeFileSync(filePath, content);
console.log('Fixed bugs successfully');
